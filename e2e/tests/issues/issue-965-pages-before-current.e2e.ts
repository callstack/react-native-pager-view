import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: iOS keeps the old index too, which #1078 addresses.
const options = {
  tags: ['regression', 'issue-965', 'issue-808'],
  platforms: ['android'],
};

/** Opens the repro and waits for the pager to report page C. */
async function openRepro(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Issue #965 Pages Before Current Repro');
  await expect(screen.getByTestId('issue-965-status')).toHaveText(
    'Selected: 2 (C) | Events: 1'
  );
}

/** Taps a repro button and checks that page C is reported at `index`. */
async function expectCAt(
  screen: Screen,
  button: string,
  index: number
): Promise<void> {
  const status = `Selected: ${index} (C) | Events: 2`;
  await screen.getByTestId(button).tap();
  await expect(screen.getByTestId('issue-965-status')).toHaveText(status);
  await expect(screen.getByText('Page C')).toBeVisible();
  // No late second event.
  await expect(screen.getByTestId('issue-965-status')).toHaveText(status);
}

test(
  'inserting a page before the current one keeps it visible',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await expectCAt(screen, 'issue-965-insert-first', 3);
  }
);

test(
  'inserting a page at the current index keeps the current page',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await expectCAt(screen, 'issue-965-insert-before-c', 3);
  }
);

test(
  'removing a page before the current one keeps it visible',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await expectCAt(screen, 'issue-965-remove-first', 1);
  }
);

test(
  'removing pages up to the current index keeps it visible',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    // C moves to index 0, and the old index 2 is now past the end.
    await expectCAt(screen, 'issue-965-remove-first-two', 0);
  }
);

test(
  'moving the current page keeps it visible',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await expectCAt(screen, 'issue-965-move-c-first', 0);
  }
);

test(
  'moving a page next to the current one keeps it rendered',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    // Fabric applies a move as a remove and an insert of the same view.
    await expectCAt(screen, 'issue-965-move-c-last', 3);
    await screen
      .getByText('Page C')
      .swipe({ direction: 'left', momentum: 'fast' });
    await expect(screen.getByTestId('issue-965-status')).toHaveText(
      'Selected: 2 (D) | Events: 3'
    );
    await expect(screen.getByText('Page D')).toBeVisible();
  }
);
