import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: iOS already shows pages that arrive later, and it reports page 0
// before it has any.
const options = {
  tags: ['regression', 'issue-219'],
  platforms: ['android'],
};

/** Opens the repro and waits for the empty pager. */
async function openRepro(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Issue #219 Empty Pager Repro');
  await expect(screen.getByTestId('issue-219-status')).toHaveText(
    'Pages: 0 | Selected: - | Events: 0'
  );
}

/** Adds the pages and waits for the pager to report page A. */
async function addPages(screen: Screen): Promise<void> {
  await screen.getByTestId('issue-219-add-pages').tap();
  await expect(screen.getByTestId('issue-219-status')).toHaveText(
    'Pages: 4 | Selected: 0 | Events: 1'
  );
}

test(
  'a pager that mounts empty shows its first page when pages arrive',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await addPages(screen);
    // Before the fix the pager stayed blank until it was touched.
    await expect(screen.getByText('Page A')).toBeVisible();
  }
);

test(
  'a pager that loses all its pages shows them again when they come back',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await addPages(screen);
    await expect(screen.getByText('Page A')).toBeVisible();
    for (let cycle = 0; cycle < 2; cycle++) {
      await screen.getByTestId('issue-219-remove-pages').tap();
      await expect(screen.getByText('Page A')).toBeHidden();
      await screen.getByTestId('issue-219-add-pages').tap();
      await expect(screen.getByText('Page A')).toBeVisible();
    }
  }
);

test(
  'setPage works as soon as pages arrive in a pager that mounted empty',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await addPages(screen);
    // Before the fix setPage did nothing until the pager was touched.
    await screen.getByTestId('issue-219-select-c').tap();
    await expect(screen.getByTestId('issue-219-status')).toHaveText(
      'Pages: 4 | Selected: 2 | Events: 2'
    );
    await expect(screen.getByText('Page C')).toBeVisible();
  }
);
