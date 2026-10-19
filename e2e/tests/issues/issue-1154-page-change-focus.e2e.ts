import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

const options = { tags: ['regression', 'issue-1154'] };

/**
 * Checks the selected page, the focused input, and the keyboard, which has to
 * follow the focus. The keyboard is checked on iOS only: Android runs a
 * headless IME that never reports it. An iOS check that fails with
 * `Keyboard: hidden` means the simulator is showing no software keyboard
 * because it has seen a Mac keyboard once, which it remembers across boots.
 * `xcrun simctl spawn booted defaults write com.apple.keyboard.preferences
 * HardwareKeyboardLastSeen -bool false` clears that.
 */
async function expectStatus(
  screen: Screen,
  platform: string,
  page: number,
  focused: string
): Promise<void> {
  const keyboard =
    platform === 'ios'
      ? ` Keyboard: ${focused === 'none' ? 'hidden' : 'visible'}`
      : '';
  await expect(screen.getByTestId('issue-1154-status')).toHaveText(
    new RegExp(`^Selected: ${page} \\| Focused: ${focused} \\|${keyboard}`)
  );
}

/** Opens the repro and focuses the input on page `page`. */
async function focusInputOnPage(
  app: App,
  screen: Screen,
  platform: string,
  page: number
): Promise<void> {
  await openExample(app, screen, 'Issue #1154 Page Change Focus Repro');
  if (page !== 0) {
    await screen.getByTestId(`issue-1154-go-${page}`).tap();
  }
  await screen.getByTestId(`issue-1154-input-${page}`).tap();
  await expectStatus(screen, platform, page, `input ${page}`);
}

test(
  'leaving a page with setPage blurs its input',
  options,
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 1);

    // Before the fix the off-screen input kept focus.
    await screen.getByTestId('issue-1154-go-0').tap();
    await expectStatus(screen, platform, 0, 'none');
  }
);

test(
  'leaving a page with a swipe blurs its input',
  options,
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // Swipe on the page title: a swipe that starts on the input is taken by
    // the input instead of the pager.
    await screen
      .getByTestId('issue-1154-label-0')
      .swipe({ direction: 'right', momentum: 'fast' });
    await expectStatus(screen, platform, 1, 'none');
  }
);

test(
  'an input focused on the new page keeps focus',
  options,
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 1);

    // Focused right after setPage, before the pager has settled.
    await screen.getByTestId('issue-1154-mode-onPress').tap();
    await screen.getByTestId('issue-1154-go-0').tap();
    await expectStatus(screen, platform, 0, 'input 0');
  }
);

// A focus call made from an `onPageSelected` handler is covered for a swipe
// only. iOS reports the selection when SwiftUI applies it, at the start of an
// animated `setPage`, and a focus call made then can land on a page that is
// not in the window yet, where it silently does nothing.

test(
  'a swipe keeps the focus the new page takes from onPageSelected',
  options,
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    await screen.getByTestId('issue-1154-mode-onSelected').tap();
    await screen
      .getByTestId('issue-1154-label-0')
      .swipe({ direction: 'right', momentum: 'fast' });
    await expectStatus(screen, platform, 1, 'input 1');
  }
);
