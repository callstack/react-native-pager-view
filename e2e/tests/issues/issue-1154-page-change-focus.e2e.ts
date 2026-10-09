import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: on iOS the pager never kept focus on the page being left.
const options = { tags: ['regression', 'issue-1154'], platforms: ['android'] };

/**
 * Checks the selected page and the focused input. The keyboard part of the
 * status line is not checked: agent-device swaps in its own headless IME for
 * the run, so React Native never reports the keyboard as shown.
 */
async function expectStatus(
  screen: Screen,
  page: number,
  focused: string
): Promise<void> {
  await expect(screen.getByTestId('issue-1154-status')).toHaveText(
    new RegExp(`^Selected: ${page} \\| Focused: ${focused} \\|`)
  );
}

/** Opens the repro and focuses the input on page `page`. */
async function focusInputOnPage(
  app: App,
  screen: Screen,
  page: number
): Promise<void> {
  await openExample(app, screen, 'Issue #1154 Page Change Focus Repro');
  if (page !== 0) {
    await screen.getByTestId(`issue-1154-go-${page}`).tap();
  }
  await screen.getByTestId(`issue-1154-input-${page}`).tap();
  await expectStatus(screen, page, `input ${page}`);
}

test(
  'leaving a page with setPage blurs its input',
  options,
  async ({ app, screen }) => {
    await focusInputOnPage(app, screen, 1);

    // Before the fix the off-screen input kept focus.
    await screen.getByTestId('issue-1154-go-0').tap();
    await expectStatus(screen, 0, 'none');
  }
);

test(
  'leaving a page with a swipe blurs its input',
  options,
  async ({ app, screen }) => {
    await focusInputOnPage(app, screen, 0);

    // Swipe on the page title: a swipe that starts on the input is taken by
    // the input instead of the pager.
    await screen
      .getByTestId('issue-1154-label-0')
      .swipe({ direction: 'right' });
    await expectStatus(screen, 1, 'none');
  }
);

test(
  'an input focused on the new page keeps focus',
  options,
  async ({ app, screen }) => {
    await focusInputOnPage(app, screen, 1);

    // Focused right after setPage, while the pager is still animating.
    await screen.getByTestId('issue-1154-mode-onPress').tap();
    await screen.getByTestId('issue-1154-go-0').tap();
    await expectStatus(screen, 0, 'input 0');

    // Focused from onPageSelected, once the pager has settled.
    await screen.getByTestId('issue-1154-mode-onSelected').tap();
    await screen.getByTestId('issue-1154-go-1').tap();
    await expectStatus(screen, 1, 'input 1');
  }
);
