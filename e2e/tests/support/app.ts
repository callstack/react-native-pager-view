import { appSession, expect } from './test.ts';
import type { App, Device, Screen } from './test.ts';
import { APP_ID } from '../../targets.ts';

export type LayoutDirection = 'ltr' | 'rtl';

const HOME_READY_TEST_ID = 'example-basic-horizontal';
// The first cold start of the release app on a freshly booted CI emulator
// can keep the window off the accessibility tree for over 15 s.
const LAUNCH_TIMEOUT = 30_000;
const LINK_TIMEOUT = 10_000;
const RESET_TIMEOUT = 3_000;
// iOS asks "Open in “PagerViewExample”?" (localized, but always naming the
// app) the first time a simulator opens the scheme, and hides the app until
// it is answered. Matching the name keeps examples' own alerts, such as
// OnPageSelected's on mount, for the tests to handle.
const LINK_PROMPT_NAME = /PagerViewExample/;
const HOME_LIST_TEST_ID = 'home-list';

/** Waits until the home list of the example app has rendered. */
export async function waitForHome(screen: Screen): Promise<void> {
  await expect(screen.getByTestId(HOME_READY_TEST_ID)).toBeVisible({
    timeout: LAUNCH_TIMEOUT,
  });
}

/** Expects the home list, unscrolled as an example link leaves it. */
export async function expectHome(screen: Screen): Promise<void> {
  await expect(screen.getByTestId(HOME_READY_TEST_ID)).toBeVisible();
}

let mountCount = 0;

/**
 * Opens an example by its home-list testID through the example app's
 * `pagerview://example/<testID>` link, without scrolling the home list to find
 * its row. Examples without an explicit testID use their display name as the
 * testID. Every test gets a freshly mounted example in the layout direction it
 * asked for, LTR by default, because the toggle persists across launches and
 * every gesture in the suite assumes that direction.
 *
 * While the app is trusted and already in that direction, the link resets its
 * stack in place: no relaunch and no push animation. Otherwise the app is
 * relaunched, the direction forced on the home list, and the link pushes the
 * example over it.
 */
export async function openExample(
  device: Device,
  app: App,
  screen: Screen,
  testId: string,
  direction: LayoutDirection = 'ltr'
): Promise<void> {
  const mount = String(++mountCount);
  const link = `pagerview://example/${encodeURIComponent(
    testId
  )}?mount=${mount}`;
  const running = appSession.state;
  appSession.state = undefined;

  if (running?.direction === direction) {
    await device.openLink(`${link}&reset`);
    // The reset swaps the examples in one commit, so the old mount leaving
    // the tree means the new one is in place.
    await screen
      .getByTestId(
        running.mount === undefined
          ? HOME_LIST_TEST_ID
          : `example-mount-${running.mount}`
      )
      .waitFor({ state: 'detached', timeout: LINK_TIMEOUT });
    // A window the last test left open survives the reset and covers the
    // example: an alert, or Android's spell-check suggestions popup after a
    // tap in a multiline input. Only a relaunch closes those reliably.
    const shown = await screen
      .getByTestId(`example-mount-${mount}`)
      .waitFor({ timeout: RESET_TIMEOUT })
      .then(
        () => true,
        () => false
      );
    if (shown) {
      appSession.state = { direction, mount };
      return;
    }
  }

  await device.openApp(APP_ID, { relaunch: true });
  await ensureLayoutDirection(app, screen, direction);
  await device.openLink(link);

  const prompt = screen.getByRole('alert', LINK_PROMPT_NAME);
  const home = screen.getByTestId(HOME_READY_TEST_ID);
  const deadline = Date.now() + LINK_TIMEOUT;
  while (Date.now() < deadline) {
    if (await prompt.isVisible()) {
      await device.alert('accept');
      break;
    }
    if (await home.isHidden()) break;
  }
  // The home list stays in the tree until the push has finished, while the
  // pushed content shows from the start. UIKit drops a gesture sent during the
  // push animation, which is every time on iOS 18.
  await screen
    .getByTestId(HOME_LIST_TEST_ID)
    .waitFor({ state: 'detached', timeout: LINK_TIMEOUT });
  appSession.state = { direction, mount };
}

/**
 * Forces the requested layout direction. The header toggle persists the
 * direction and reloads only in debug builds, so the app is relaunched
 * explicitly. A failed RTL run therefore cannot leak into the next LTR test.
 */
export async function ensureLayoutDirection(
  app: App,
  screen: Screen,
  direction: LayoutDirection
): Promise<void> {
  await waitForHome(screen);
  const opposite: LayoutDirection = direction === 'ltr' ? 'rtl' : 'ltr';
  const toggle = screen.getByTestId(`layout-direction-${opposite}`);
  if (await toggle.isVisible()) {
    await toggle.tap();
    // The toggle reflects the pending direction at once; waiting for the flip
    // keeps the relaunch's force-stop from racing I18nManager's async
    // preference write on a loaded Android emulator.
    await expect(
      screen.getByTestId(`layout-direction-${direction}`)
    ).toBeVisible();
    await app.restart();
    await waitForHome(screen);
  }
  await expect(screen.getByTestId(`layout-direction-${direction}`)).toBeVisible(
    { timeout: LAUNCH_TIMEOUT }
  );
}
