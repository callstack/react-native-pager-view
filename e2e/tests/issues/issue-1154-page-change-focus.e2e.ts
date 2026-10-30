import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample, restoreLtrAfterEach } from '../support/app.ts';

freshAppBeforeEach();

const options = { tags: ['regression', 'issue-1154'] };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Longer than the 0.8s the default spring takes to settle. */
const SETTLE_MS = 1000;

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

/** Waits for the pager to report that it has stopped on `page`. */
async function expectIdleAt(screen: Screen, page: number): Promise<void> {
  await expect(screen.getByTestId('issue-1154-events')).toHaveText(
    new RegExp(`state idle at ${page}`)
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
    await expectIdleAt(screen, page);
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

    // Blurring during the slide used to land the pager on page 2, so the page
    // is checked once the pager reports coming to rest.
    await screen.getByTestId('issue-1154-go-1').tap();
    await expectIdleAt(screen, 1);
    await wait(SETTLE_MS);
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
    await expectIdleAt(screen, 2);
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 2, 'none');
  }
);

test(
  'a setPage repeated during the slide changes nothing',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // The second command names the page already arriving, so it moves
    // nothing and must not disturb the slide or the blur.
    await screen.getByTestId('issue-1154-go-1-twice').tap();
    await expectIdleAt(screen, 1);
    await wait(SETTLE_MS);
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

    // Focused right after setPage, before the pager has settled. The status
    // reads right as the slide starts, so the second check waits out the
    // settle, where a late blur or an overshoot would show. The keyboard
    // reopening ends this slide's scroll early, at page 0, so its idle report
    // is no use as a signal here.
    await screen.getByTestId('issue-1154-mode-onPress').tap();
    await screen.getByTestId('issue-1154-go-1').tap();
    await expectStatus(screen, platform, 1, 'input 1');
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 1, 'input 1');
  }
);

test(
  'an input focused on the new page keeps focus going back',
  { ...options, platforms: ['android'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 1);

    // The same case backwards, which iOS drops: a focus sent in the same tick
    // as the command does not reach the page the pager moves back to, with or
    // without an input focused first. Forward it survives.
    await screen.getByTestId('issue-1154-mode-onPress').tap();
    await screen.getByTestId('issue-1154-go-0').tap();
    await expectStatus(screen, platform, 0, 'input 0');
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 0, 'input 0');
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
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 1, 'input 1');
  }
);

test(
  'a setPage that interrupts another lands on the page asked for last',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // The second command goes back a page, so an overshoot lands on page 0
    // where this can see it. The interrupted slide's idle names whichever page
    // it had reached by then, so the wait is the settle rather than that
    // report.
    await screen.getByTestId('issue-1154-go-2-then-1').tap();
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 1, 'none');
  }
);

test(
  'a setPage that interrupts another still lands on the later page',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // The first command focuses page 1's input as it leaves page 0, and the
    // second one redirects to page 2 while that slide runs, so the focus lands
    // on a page the pager has already left. An overshoot lands on page 3. The
    // landing of a redirected slide reports no idle, so the wait is the settle
    // and the page comes from the selection, which an overshoot changes.
    await screen.getByTestId('issue-1154-mode-onPress').tap();
    await screen.getByTestId('issue-1154-go-1-then-2').tap();
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 2, 'none');
  }
);

test(
  'a setPage redirected once the focus has landed blurs it',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // The focus on page 1 lands before the redirect to page 2 arrives, so the
    // blur before that page change is the one that resigns it, in the middle
    // of a slide, where resigning used to break the slide. An overshoot lands
    // on page 3, which the selection would report.
    await screen.getByTestId('issue-1154-go-1-then-2-late').tap();
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 2, 'none');
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
  'two setPage calls that cancel out land on the first page',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await focusInputOnPage(app, screen, platform, 0);

    // Each setPage blurs before the pager moves, so the first one has already
    // taken the focus by the time the second one sends the pager back. The
    // pager never moves here, so there is no report of it coming to rest to
    // wait for.
    await screen.getByTestId('issue-1154-go-1-and-0').tap();
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 0, 'none');
  }
);

test.describe('right to left', () => {
  restoreLtrAfterEach();

  test(
    'leaving a page with a swipe blurs its input',
    { ...options, platforms: ['ios'] },
    async ({ app, screen, platform }) => {
      await openExample(
        app,
        screen,
        'Issue #1154 Page Change Focus Repro',
        'rtl'
      );
      await screen.getByTestId('issue-1154-input-0').tap();
      await expectStatus(screen, platform, 0, 'input 0');

      // The pages are mirrored, so the gesture is reversed and the page the
      // pager reports at rest counts from the other end.
      await screen
        .getByTestId('issue-1154-label-0')
        .swipe({ direction: 'left', momentum: 'fast' });
      await expectStatus(screen, platform, 1, 'none');
    }
  );
});

test(
  'a page that grows with the keyboard still lands on the target page',
  { ...options, platforms: ['ios'] },
  async ({ app, screen, platform }) => {
    await openExample(app, screen, 'Issue #1154 Page Change Focus Repro');
    await screen.getByTestId('issue-1154-avoid').tap();
    await screen.getByTestId('issue-1154-input-0').tap();
    await expectStatus(screen, platform, 0, 'input 0');

    // The blur closes the keyboard before the slide starts, so the page
    // relayouts as the pager begins to move, which must not move the pager
    // anywhere but page 1.
    await screen.getByTestId('issue-1154-go-1').tap();
    await expectIdleAt(screen, 1);
    await wait(SETTLE_MS);
    await expectStatus(screen, platform, 1, 'none');
  }
);
