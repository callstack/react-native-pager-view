import { mobile } from '@e2e-dev/mobile';

export const APP_ID = 'com.pagerviewexample';

/**
 * Devices named in `E2E_DEVICES` (comma-separated names or UDIDs) or the
 * single `E2E_DEVICE`. Empty leaves discovery to the engine: every booted
 * simulator or emulator of the platform forms the pool.
 */
export const devices: readonly string[] = (
  process.env.E2E_DEVICES ??
  process.env.E2E_DEVICE ??
  ''
)
  .split(',')
  .map((name) => name.trim())
  .filter((name) => name.length > 0);

/**
 * Worker cap for the run. The engine never runs more than one worker per
 * device, so this only has to be large enough for the pool; CI would
 * otherwise default to a single worker.
 */
export const workers = Math.max(4, devices.length);

const device = devices.length === 0 ? undefined : devices;

export const targets = [
  {
    name: 'ios',
    platform: 'ios',
    engine: mobile({ platform: 'ios', device }),
    app: { bundleId: APP_ID, appPath: process.env.E2E_IOS_APP_PATH },
  },
  {
    name: 'android',
    platform: 'android',
    engine: mobile({ platform: 'android', device }),
    app: { bundleId: APP_ID, appPath: process.env.E2E_ANDROID_APK_PATH },
  },
];
