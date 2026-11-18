import { test as baseTest } from '@e2e-dev/mobile';

export { expect } from 'e2e';
export type { App, Locator, Screen, ScrollDirection, TextMatch } from 'e2e';
export type { Device } from '@e2e-dev/mobile';

const APP_PATHS: Record<string, string | undefined> = {
  ios: process.env.E2E_IOS_APP_PATH,
  android: process.env.E2E_ANDROID_APK_PATH,
};

/**
 * What this realm knows about the running app, while it can be trusted: the
 * layout direction it launched with and the mount id of the example on
 * screen (undefined when it shows home). Undefined means relaunch first.
 */
export const appSession: {
  state: { direction: 'ltr' | 'rtl'; mount: string | undefined } | undefined;
  lastTestPassed: boolean;
} = { state: undefined, lastTestPassed: false };

/**
 * The engine's `test`, with every test body wrapped so a test that fails or
 * never finishes (a timeout abandons the body without rejecting it) leaves
 * the app untrusted for the next one: an alert, keyboard or modal it left up
 * would survive an in-app reset.
 */
export const test: typeof baseTest = new Proxy(baseTest, {
  apply(target, thisArg, args: unknown[]) {
    const body = args.at(-1) as (fixtures: unknown) => Promise<void>;
    args[args.length - 1] = async (fixtures: unknown) => {
      if (!appSession.lastTestPassed) appSession.state = undefined;
      appSession.lastTestPassed = false;
      await body(fixtures);
      appSession.lastTestPassed = true;
    };
    return Reflect.apply(target, thisArg, args);
  },
});

/**
 * Registers a beforeEach that installs the build when E2E_IOS_APP_PATH /
 * E2E_ANDROID_APK_PATH is set. Call it at the top of every test file: the
 * engine neither installs nor launches anything on its own, and a
 * module-level hook in this shared file would only attach to the first file
 * evaluated in a realm. The install replaces the binary and keeps its data, so
 * it stays correct across device pools and realms without tracking what is
 * already on which device; it also stops the app. Launching is left to
 * openExample, which reuses a running app it can trust.
 */
export function freshAppBeforeEach(): void {
  test.beforeEach(async ({ device, platform }) => {
    if (APP_PATHS[platform]) {
      appSession.state = undefined;
      await device.installApp();
    }
  });
}
