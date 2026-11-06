import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

const options = {
  tags: ['regression', 'issue-1230'],
  platforms: ['ios'] as const,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Longer than the 0.8s the default spring takes to settle. */
const SETTLE_MS = 1000;

test(
  'a pager scrolled to a focused field still lands on the page asked for',
  options,
  async ({ app, screen }) => {
    await openExample(app, screen, 'Issue #1230 Pager Between Pages Repro');

    // A pager left between pages reports no rest, so the input on the page
    // being left keeps focus, and the status is what gives the landing away:
    // without the fix it reads `Focused: input 1` in five runs of six.
    await screen.getByTestId('issue-1230-strand').tap();
    await wait(SETTLE_MS);

    await expect(screen.getByTestId('issue-1230-status')).toHaveText(
      /^Selected: 2 \| Focused: none/
    );
  }
);
