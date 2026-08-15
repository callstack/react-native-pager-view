# Maestro

Run E2E tests from the repository root:

```bash
bun run e2e:ios
bun run e2e:android
```

These commands build and install the release example app, then run the Maestro flows for the selected platform.

If the example app is already installed on a running device or simulator, run Maestro directly:

```bash
bun run maestro:test:ios
bun run maestro:test:android
```

Use `bun run maestro:smoke` to run only the smoke flow.
`maestro:debug` writes failure artifacts to `.maestro/debug-output`.

The smoke flow targets the example app ID `com.pagerviewexample` and verifies the horizontal pager using stable `testID` selectors.

Basic PagerView regression coverage is split into three deterministic flows:

- `tests/pager_basic_example.yaml` verifies horizontal paging in LTR.
- `tests/pager_vertical_basic_example.yaml` verifies vertical paging in LTR.
- `tests/pager_rtl_example.yaml` switches to RTL before verifying the reversed horizontal gesture.

Shared setup and assertions live in `flows/basic-pager`. Each flow resets the app to the required layout direction, so a failed RTL run cannot affect the next test.
