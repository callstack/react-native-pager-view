import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

test(
  'keyboard avoidance does not shrink the page under the keyboard',
  // iOS-only, like the original Maestro flow: the bug is SwiftUI keyboard
  // avoidance, while Android's adjustResize shrinks the window by design and
  // covers the last row on short screens.
  { tags: ['regression', 'issue-1096'], platforms: ['ios'] },
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

    // iOS exposes no dismiss key, so submit through the input, refocused
    // first because the row tap can steal focus.
    await input.tap();
    await input.press('Enter');

    await lastRow.tap();
    await expect(counter).toHaveText('last-row taps: 2');
  }
);
