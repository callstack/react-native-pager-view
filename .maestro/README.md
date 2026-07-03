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

The smoke flow targets the example app ID `com.pagerviewexample` and verifies the Basic Example pager using stable `testID` selectors.
Additional Basic Example regression flows live in `.maestro/basic_example`.
Nested PagerView regression flows live in `.maestro/nested_pager_view_example`.
