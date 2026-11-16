import { expect, test } from './test.ts';
import type { App, Device, Screen } from './test.ts';

export type LayoutDirection = 'ltr' | 'rtl';

const HOME_READY_TEST_ID = 'example-basic-horizontal';
// The first cold start of the release app on a freshly booted CI emulator
// can keep the window off the accessibility tree for over 15 s.
const LAUNCH_TIMEOUT = 30_000;
const LINK_TIMEOUT = 10_000;
// iOS asks "Open in “PagerViewExample”?" (localized, but always naming the
// app) the first time a simulator opens the scheme, and hides the app until
// it is answered. Matching the name keeps examples' own alerts, such as
// OnPageSelected's on mount, for the tests to handle.
const LINK_PROMPT_NAME = /PagerViewExample/;

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

/**
 * Opens an example by its home-list testID through the example app's
 * `pagerview://example/<testID>` link, which pushes it over the home list as a
 * tap on its row would, without scrolling the list to find the row. Examples
 * without an explicit testID use their display name as the testID. The layout
 * direction is forced first, LTR by default, because the toggle persists
 * across launches and every gesture in the suite assumes the direction it
 * asked for.
 */
export async function openExample(
  device: Device,
  app: App,
  screen: Screen,
  testId: string,
  direction: LayoutDirection = 'ltr'
): Promise<void> {
  await ensureLayoutDirection(app, screen, direction);
  await device.openLink(`pagerview://example/${encodeURIComponent(testId)}`);

  const prompt = screen.getByRole('alert', LINK_PROMPT_NAME);
  const home = screen.getByTestId(HOME_READY_TEST_ID);
  const deadline = Date.now() + LINK_TIMEOUT;
  while (Date.now() < deadline) {
    if (await prompt.isVisible()) {
      await device.alert('accept');
      return;
    }
    if (await home.isHidden()) return;
  }
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

/**
 * Registers an afterEach hook that hands the device back in LTR. Call it in
 * every describe block that switches to RTL, because the direction persists
 * across launches and the hook runs after failures too.
 */
export function restoreLtrAfterEach(): void {
  test.afterEach(async ({ app, screen }) => {
    await app.restart();
    await ensureLayoutDirection(app, screen, 'ltr');
  });
}
