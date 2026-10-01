# e2e

End-to-end tests for the example app, written in TypeScript and run with
[e2e](https://github.com/tester-army/e2e) on the `@e2e-dev/mobile` engine.
Tests drive iOS simulators and Android emulators through the accessibility
tree, so the same file runs on both platforms.

## Setup

```bash
cd e2e && bun install
npx agent-device doctor
```

`agent-device doctor` checks for Xcode with a simulator runtime, or the Android
SDK with an emulator.

## Run

From the repository root, bundle the JS, build and install the release example
app, then run the suite:

```bash
bun run e2e:ios
bun run e2e:android
```

The release app of react-native-test-app loads the prebuilt bundle from
`example/dist`, so `example/ios/Pods` must have been installed after that
directory existed at least once (`bun run --cwd example build:ios && bun run
bootstrap`).

If the example app is already installed on a booted simulator or emulator:

```bash
bun run e2e:test:ios
bun run e2e:test:android
```

From this directory, `bun run test:ios -- --tag smoke` runs only the smoke
test, and `bun run list` prints every test without running it.

### Several simulators at once

With nothing pinned, the engine uses every booted simulator as the pool, so
`bun run e2e:test:ios` already spreads the suite across whatever is open. To
choose explicitly, list simulators by name or UDID in `E2E_DEVICES` and point
`E2E_IOS_APP_PATH` at the build so each one gets the app installed before its
first test:

```bash
APP=$(ls -d ~/Library/Developer/Xcode/DerivedData/PagerViewExample-*/Build/Products/Release-iphonesimulator/ReactTestApp.app | head -1)
E2E_DEVICES="iPhone 17,iPhone 16e,iPhone 17 Pro Max,iPhone Air" E2E_IOS_APP_PATH="$APP" bun run e2e:test:ios
```

`targets.ts` turns the list into a device pool. The engine boots every device
up front, declares one worker per device, and the runner spreads the test
files across them. 13 tests: about 375 s on one simulator, 190 s on two, 130 s
on four. Remote devices fit the same shape: one pool entry per device.

| Variable | Effect |
| --- | --- |
| `E2E_DEVICE` | Simulator or emulator name or UDID. Default: every booted device of the platform. |
| `E2E_DEVICES` | Comma-separated pool of names or UDIDs, for example `iPhone 17,iPhone 17 Pro`. One worker per device; the test files spread across them. Every device needs the app installed, or set `E2E_IOS_APP_PATH`. |
| `E2E_IOS_APP_PATH` | `.app` bundle installed on every pooled device before its first test. Use the Xcode build product (`~/Library/Developer/Xcode/DerivedData/PagerViewExample-*/Build/Products/Release-iphonesimulator/ReactTestApp.app`), never a path inside a simulator's own container: installing replaces that container and the path disappears mid-run. |
| `E2E_ANDROID_APK_PATH` | `.apk` to install before the first test instead of using the installed build. |

## Layout

- `targets.ts` declares one mobile engine per platform, both pinned to
  the `com.pagerviewexample` app; `e2e.config.ts` runs the suite with them.
- `tests/*.e2e.ts` hold one scenario per example screen.
- `tests/issues/*.e2e.ts` hold regression scenarios, tagged `regression` and
  `issue-<number>` where a GitHub issue exists.
- `tests/support/test.ts` re-exports `test` and `expect` (import them from
  there so the engine can change in one place) and exports
  `freshAppBeforeEach()`, which every test file calls to relaunch the app
  before each test (installing the `E2E_*_APP_PATH` build first when set).
- `tests/support/app.ts` opens an example from the home list and forces the
  layout direction.
- `tests/support/basic-pager.ts` holds the checks shared by the LTR, vertical,
  and RTL basic pager scenarios.

## Gotchas

- Swipe directions are scroll directions: `swipe({ direction: 'right' })`
  moves the finger left and reveals the next page in LTR.
- Node swipes fling. Use `screen.scrollUntilVisible` with a target that stays
  on screen after any fling (the last item) instead of a middle one.
- The layout direction toggle persists across launches. `openExample` forces
  the direction it is given, and every RTL describe block calls
  `restoreLtrAfterEach()`.
- The engine neither installs nor launches anything on its own, so every
  test file calls `freshAppBeforeEach()` right after its imports: it
  relaunches the app with `device.openApp(APP_ID, { relaunch: true })`, so
  every test starts fresh at the home list. A module-level hook in
  `tests/support/test.ts` would attach only to the first file evaluated in a
  realm, and `app.open()` or `app.restart()` resume a running app the
  surface does not know about. State shared between tests must be state the
  app persists (the layout direction toggle is).
- With `E2E_*_APP_PATH` set, the hook runs `device.installApp()` before
  every relaunch (~2 s each on a simulator) instead of tracking which device
  already has the build: an install replaces the binary and keeps its data,
  so repeating it is correct across device pools and realms.
- A connected physical iPhone joins the default device pool and fails with
  `ENGINE_FAILURE` when it is locked or lacks the app. Pin `E2E_DEVICE` to a
  simulator when a phone is plugged in.

## CI

`.github/workflows/ios.yml` and `android.yml` build the release example app,
install it on a simulator or emulator, and run the suite for their platform.
The `github()` reporter from `@e2e-dev/github` is in `e2e.config.ts`; it does
nothing locally and on Actions writes the job summary and one PR comment per
run (the workflows pass `GITHUB_TOKEN` and hold `pull-requests: write`).
`.e2e/report.json` and the artifacts upload on every non-cancelled run.

## Debugging

A failed run prints the error code and the failing line. `.e2e/report.json`
lists every step with its screenshot under `.e2e/artifacts/`. Both are
gitignored. See `.agents/skills/e2e/references/debugging.md` for the error
code table.
