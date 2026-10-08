import { test } from '@e2e-dev/mobile';
import { APP_ID } from '../../targets.ts';

export { test };
export { expect } from 'e2e';
export type { App, Locator, Screen, ScrollDirection, TextMatch } from 'e2e';

const APP_PATHS: Record<string, string | undefined> = {
  ios: process.env.E2E_IOS_APP_PATH,
  android: process.env.E2E_ANDROID_APK_PATH,
};

/**
 * Registers a beforeEach that relaunches the app, so every test in the file
 * starts fresh at the home list. Call it at the top of every test file: the
 * engine neither installs nor launches anything on its own, a module-level
 * hook in this shared file would only attach to the first file evaluated in
 * a realm, and the explicit relaunch terminates first where app.open() or
 * app.restart() only resume an app the surface does not know is running.
 * With E2E_IOS_APP_PATH / E2E_ANDROID_APK_PATH set, that build is installed
 * before every relaunch: the install replaces the binary and keeps its data,
 * so it stays correct across device pools and realms without tracking what
 * is already on which device. State survives the relaunch only when the app
 * persists it (the layout direction toggle does).
 */
export function freshAppBeforeEach(): void {
  test.beforeEach(async ({ device, platform }) => {
    if (APP_PATHS[platform]) await device.installApp();
    await device.openApp(APP_ID, { relaunch: true });
  });
}
