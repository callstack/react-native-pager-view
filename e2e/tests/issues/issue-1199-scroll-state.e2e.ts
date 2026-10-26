import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: the Compose pager has to keep reporting settling until the
// snap after a drag has finished.
const options = { tags: ['regression', 'issue-1199'], platforms: ['android'] };

/** Opens the repro and waits for its status line. */
async function openRepro(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Issue #1199 Scroll State Repro');
  await expect(screen.getByTestId('issue-1199-status')).toHaveText(
    'No scroll yet'
  );
}

test(
  'setPage reports settling, then idle once the page has stopped',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await screen.getByTestId('issue-1199-next').tap();
    await expect(screen.getByTestId('issue-1199-status')).toHaveText(
      'settling > idle | idle at rest: yes'
    );
  }
);

test(
  'a swipe reports settling when the finger lifts, then idle once the page has stopped',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    // Before the fix this was "dragging > idle | idle at rest: no": idle
    // arrived as the finger lifted, while the page was still moving.
    await screen
      .getByTestId('issue-1199-page-0')
      .swipe({ direction: 'right', momentum: 'fast' });
    await expect(screen.getByTestId('issue-1199-status')).toHaveText(
      'dragging > settling > idle | idle at rest: yes'
    );
  }
);
