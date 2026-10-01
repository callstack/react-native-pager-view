import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

test(
  'keyboard avoidance does not shrink the page under the keyboard',
  { tags: ['regression', 'issue-1096'] },
  async ({ app, screen }) => {
    await openExample(app, screen, 'Issue #1096 Keyboard Shrink Repro');
    await expect(screen.getByTestId('issue-1096-pager')).toBeVisible();

    // With the keyboard open, a shrunk page clips Row 5 and moves its native
    // frame, so the tap misses and the counter stays at 0.
    const input = screen.getByTestId('issue-1096-input');
    const lastRow = screen.getByTestId('issue-1096-last-row');
    const counter = screen.getByTestId('issue-1096-counter');

    await input.tap();
    await expect(lastRow).toBeVisible();
    await lastRow.tap();
    await expect(counter).toHaveText('last-row taps: 1');

    // A single-line TextInput blurs on submit, so Enter is the reliable
    // keyboard dismiss on iOS, which exposes no dismiss key.
    await input.press('Enter');

    await lastRow.tap();
    await expect(counter).toHaveText('last-row taps: 2');
  }
);
