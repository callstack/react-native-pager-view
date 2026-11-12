import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

const options = {
  tags: ['regression', 'issue-1230'],
  platforms: ['ios'] as const,
};

test(
  'a pager scrolled to a focused field still lands on the page asked for',
  options,
  async ({ app, screen }) => {
    await openExample(app, screen, 'Issue #1230 Pager Between Pages Repro');

    // A pager left between pages reports no rest, so it never reports arriving
    // at the page asked for and the input on the page being left keeps focus.
    // The events log names the page each rest belongs to, which is the landing
    // itself rather than the selection that asked for it.
    await screen.getByTestId('issue-1230-strand').tap();

    await expect(screen.getByTestId('issue-1230-events')).toHaveText(
      /idle at 2/
    );
    await expect(screen.getByTestId('issue-1230-status')).toHaveText(
      /^Selected: 2 \| Focused: none/
    );
  }
);
