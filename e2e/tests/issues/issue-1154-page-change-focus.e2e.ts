import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

const options = { tags: ['regression', 'issue-1154'] };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Matches the wait the iOS blur falls back on when nothing reports settling. */
const PAGE_CHANGE_WAIT_MS = 1000;

/**
 * Checks the selected page, the focused input, and the keyboard, which follows
 * the focus. The keyboard is checked on iOS only: Android's headless IME never
 * reports it. An iOS failure reading `Keyboard: hidden` means the simulator is
 * showing no software keyboard, which the e2e README's device flags fix.
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

/** Waits for the pager to report that it has stopped scrolling. */
async function expectIdle(screen: Screen): Promise<void> {
  await expect(screen.getByTestId('issue-1154-events')).toHaveText(
    /state idle/
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
  'setPage with an input focused lands on the target page',
  options,
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // Blurring during the slide used to land the pager on page 2.
    await screen.getByTestId('issue-1154-go-1').tap();
    await expectStatus(screen, platform, 1, 'none');
  }
);

test(
  'a setPage two pages away lands on the far page',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // Two pages at once, so the page being left can drop out of the window
    // while the slide runs and UIKit resigns the input itself.
    await screen.getByTestId('issue-1154-go-2').tap();
    await expectIdle(screen);
    await expectStatus(screen, platform, 2, 'none');
  }
);

test(
  'a setPage repeated during the slide still blurs',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // The repeat used to cancel the wait, so the blur never ran at all.
    await screen.getByTestId('issue-1154-go-1-twice').tap();
    await expectStatus(screen, platform, 1, 'none');
  }
);

test(
  'leaving a page with a swipe blurs its input',
  options,
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // Swipe the title: a swipe starting on the input is taken by the input.
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
    await focusInputOnPage(app, screen, platform, 0);

    // Focused right after setPage, before the pager has settled, and checked
    // again once it reports stopping: the first check holds a few milliseconds
    // in, so a slide that then lands on page 2 would pass unseen.
    await screen.getByTestId('issue-1154-mode-onPress').tap();
    await screen.getByTestId('issue-1154-go-1').tap();
    await expectStatus(screen, platform, 1, 'input 1');
    await expectIdle(screen);
    await expectStatus(screen, platform, 1, 'input 1');
  }
);

// A focus call from an `onPageSelected` handler is covered for a swipe only:
// iOS reports the selection as an animated `setPage` starts, when the
// destination page can still be out of the window, where focusing does nothing.

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

test(
  'a setPage that interrupts another lands on the page asked for last',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // The second command goes back a page, so an overshoot lands on page 0
    // where this can see it. The interrupted slide reports stopping for a page
    // the pager is no longer heading to, so the blur comes from the wait
    // running out and the status is checked after both.
    await screen.getByTestId('issue-1154-go-2-then-1').tap();
    await expectIdle(screen);
    await expectStatus(screen, platform, 1, 'none');
  }
);

test(
  'setPage keeps the focus the new page takes from onPageSelected',
  { ...options, platforms: ['android'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // Android reports the selection once the pager has settled, so a handler
    // can focus the new page there. iOS reports it as the slide starts, where
    // the page can still be out of the window and focus does nothing.
    await screen.getByTestId('issue-1154-mode-onSelected').tap();
    await screen.getByTestId('issue-1154-go-1').tap();
    await expectStatus(screen, platform, 1, 'input 1');
  }
);

test(
  'two setPage calls that cancel out keep the focus',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // The pager ends where it started, so it never moves and never reports
    // settling. Nothing left page 0, so its input keeps focus, and the check
    // comes after the wait has run out so the blur it schedules is included.
    await screen.getByTestId('issue-1154-go-1-and-0').tap();
    await wait(PAGE_CHANGE_WAIT_MS + 300);
    await expectStatus(screen, platform, 0, 'input 0');
  }
);
