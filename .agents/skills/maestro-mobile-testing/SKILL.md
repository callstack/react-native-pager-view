---
name: maestro-mobile-testing
description: Maestro mobile E2E testing for React Native and Expo apps. Use when Codex needs to write, review, debug, or run Maestro YAML flows; add stable testID selectors; handle mobile auth state, OTP or magic-link flows, optimistic updates, native dialogs, platform-specific behavior, CI execution, Maestro Cloud, or Maestro MCP/device-tool workflows.
---

# Maestro Mobile E2E Testing

Use this skill to produce reliable Maestro tests and to iterate on failing mobile E2E flows. Prefer project conventions first: inspect existing `.maestro/` flows, app IDs, scripts, testID naming, auth patterns, and package scripts before adding new structure.

## Codex Workflow

1. Inspect the project:
   - Find flows with `rg --files -g '*.yaml' -g '*.yml' .maestro`.
   - Find selectors with `rg 'testID=|accessibilityIdentifier|accessibilityLabel'`.
   - Check app identifiers in `app.json`, `app.config.*`, Android manifests, iOS plist files, and existing Maestro headers.
2. Choose selectors:
   - Use `id:` selectors when the app is localized, text changes often, or multiple elements share copy.
   - Use text selectors for stable, user-visible copy in single-language apps.
   - Use native dialog text for system alerts because test IDs are not available there.
3. Write or patch the smallest useful flow:
   - Add test IDs in app code only when no stable selector exists.
   - Reuse sub-flows for repeated login, setup, and verification sequences.
   - Prefer `extendedWaitUntil` over sleeps.
4. Run and iterate when tools are available:
   - Use `maestro test .maestro/<flow>.yaml`.
   - Use `maestro test --debug .maestro/<flow>.yaml` for step-through debugging.
   - Use `maestro studio` or `maestro hierarchy` to inspect selectors.
   - If a Maestro MCP server or device-control tool is available, use it to launch, tap, screenshot, run flows, inspect failures, and revise the YAML.
5. Report what changed and how it was verified. If no simulator/emulator/app is available, say exactly what could not be run.

## Install And Run

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
brew install openjdk@17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

maestro test .maestro/smoke-test.yaml
maestro test --debug .maestro/smoke-test.yaml
maestro studio
maestro hierarchy
```

Minimal flow:

```yaml
appId: com.myapp
---
- launchApp
- tapOn:
    id: "my-button"
- assertVisible: "Expected Text"
```

## Selector Strategy

When using ID-based selectors in React Native, add `testID` props:

```tsx
<TouchableOpacity testID="submit-button" onPress={handleSubmit}>
  <Text>{t('submit')}</Text>
</TouchableOpacity>
```

Use predictable IDs:

```text
{screen-or-component}-{role-or-action}[-{variant}]

auth-prompt-login-button
product-card-42
otp-input-0
tab-home
dashboard-loading
```

Avoid index-based selectors when possible. Use relative selectors to disambiguate repeated UI:

```yaml
- tapOn:
    text: "Add to Basket"
    below:
      text: "Awesome Shoes"

- tapOn:
    text: "Delete"
    childOf:
      id: "item-card-42"
```

Useful state properties:

```yaml
- assertVisible:
    id: "terms-checkbox"
    checked: true

- tapOn:
    id: "submit-button"
    enabled: true

- extendedWaitUntil:
    visible:
      id: "email-input"
      focused: true
    timeout: 3000
```

## Auth State

Do not assume launch state. On iOS, `clearState: true` does not clear Keychain-backed auth tokens such as `expo-secure-store`.

Add an auth-loaded marker in the app root or tab layout after auth resolution:

```tsx
{!isLoading && <View testID="auth-loaded" style={{ width: 0, height: 0 }} />}
```

Start tests with an auth pre-flight:

```yaml
- launchApp

# Prevent cold-boot XCTest accessibility races on iOS.
- swipe:
    direction: DOWN
    duration: 100

- extendedWaitUntil:
    visible:
      id: "auth-loaded"
    timeout: 15000
```

Handle both guest and signed-in states with conditional flows:

```yaml
- runFlow:
    when:
      visible: "Sign In"
    file: flows/sign-in.yaml

- runFlow:
    when:
      visible:
        id: "tab-home"
    file: flows/authenticated-action.yaml
```

Rules:

- Never rely on `clearState` to force guest state on iOS.
- Use adaptive flows for tests that can start authenticated or unauthenticated.
- Only assert guest-only UI after a flow explicitly signs out or clears the relevant storage.
- For tab bars that differ by auth state, assert shared tabs or branch by `when:`.

## OTP And Magic Links

Use a test email capture service such as Mailpit, MailHog, or Ethereal. Maestro JavaScript runs on GraalJS: do not use `async`, `await`, `fetch`, `const`, or `let`. Use `var`, `http.get`, `http.post`, `json`, and `output`.

```javascript
var emailServiceUrl = typeof EMAIL_SERVICE_URL !== "undefined"
  ? EMAIL_SERVICE_URL
  : "http://localhost:8025";

var response = http.get(emailServiceUrl + "/api/v1/messages");
if (!response.ok) {
  throw new Error("Failed to fetch emails: " + response.status);
}

var data = json(response.body);
var body = data.messages[0].Content.Body;
var match = body.match(/(\d{6})/);
if (!match) {
  throw new Error("OTP code not found");
}

output.OTP_CODE = match[1];
```

For OTP fields with auto-focus, tap each digit input before entering text:

```yaml
- runScript:
    file: scripts/split-otp.js
    env:
      OTP_CODE: ${output.OTP_CODE}

- tapOn:
    id: "otp-input-0"
- inputText: ${output.OTP_0}

- tapOn:
    id: "otp-input-1"
- inputText: ${output.OTP_1}
```

## Optimistic Updates

Use short waits to prove UI changes happen before a server round trip:

```yaml
- tapOn:
    id: "action-button"

- extendedWaitUntil:
    visible:
      id: "undo-button"
    timeout: 3000

- extendedWaitUntil:
    visible:
      id: "user-indicator"
    timeout: 5000
```

Guidelines:

- Mutation-triggered local state should appear in 3 seconds or less.
- List additions/removals should appear in 5 seconds or less.
- Verify a derived state or repeat action so the test catches no-op taps.

## Native Dialogs And Permissions

React Native `Alert.alert()` and OS permission prompts block the UI. Dismiss them with optional text taps after verifying the expected state change when possible.

```yaml
- tapOn:
    id: "action-button"

- extendedWaitUntil:
    visible:
      id: "new-state-element"
    timeout: 5000

- tapOn:
    text: "OK"
    optional: true
```

Android permission examples:

```yaml
- tapOn:
    text: "Allow"
    optional: true

- tapOn:
    text: "While using the app"
    optional: true
```

Use `optional: true` only for genuinely optional UI. Overusing it can hide failed interactions.

## Deep Links

For Expo, use the configured scheme from `app.json` or `app.config.*`, not the bundle ID:

```yaml
# Wrong
- openLink: "com.myapp://profile/settings"

# Correct
- openLink: "myapp://profile/settings"
```

Confirm the route is registered in the app's deep-link handler. Unregistered routes can fail silently.

## Platform Differences

```yaml
- runFlow:
    when:
      platform: ios
    file: flows/ios-specific.yaml

- runFlow:
    when:
      platform: android
    file: flows/android-specific.yaml
```

Important differences:

| Area | iOS | Android |
| --- | --- | --- |
| Local device support | Simulator | Emulator or physical device |
| `clearState` | Does not clear Keychain | Clears app data |
| Cold boot | Can hit XCTest accessibility race | No equivalent common issue |
| Permissions | System alerts | Android dialog text varies by API level |
| CI | macOS local or Maestro Cloud | Local, Docker with emulator, or Maestro Cloud |

## API Dependencies

If screens call backend APIs, start the real backend or a deterministic mock before running tests. Without it, screens often stay on loading or empty states.

```bash
npx tsx scripts/mock-api-server.ts
maestro test .maestro/my-test.yaml
```

Keep mock responses close to the app's API contract and seed state before each suite when tests depend on specific data.

## Flow Structure

Prefer this layout when no project convention exists:

```text
.maestro/
  config.yaml
  flows/
    sign-in.yaml
    complete-action.yaml
    verify-result.yaml
  scripts/
    fetch-otp.js
    split-otp.js
  smoke-test.yaml
  auth-signin.yaml
  feature-action.yaml
scripts/
  mock-api-server.ts
  run-e2e.sh
```

Name main tests as `{feature}-{action}.yaml`, sub-flows as `{action}-{context}.yaml`, and scripts as `{verb}-{noun}.js`.

Template:

```yaml
# {Feature} {Action} Test
# Validates: {expected behavior}
# Requires: simulator/emulator with app installed; backend or mock API if needed

appId: com.myapp
env:
  TEST_EMAIL: maestro-{feature}@example.com
  EMAIL_SERVICE_URL: http://localhost:8025
---
- launchApp
- swipe:
    direction: DOWN
    duration: 100
- extendedWaitUntil:
    visible:
      id: "auth-loaded"
    timeout: 15000

- takeScreenshot: 01-initial-state

- tapOn:
    id: "target-element"

- extendedWaitUntil:
    visible:
      id: "expected-result"
    timeout: 5000

- takeScreenshot: 02-final-state
```

## CI And Maestro Cloud

Use tags to separate smoke, CI, and work-in-progress flows:

```yaml
appId: com.myapp
tags:
  - ci
  - smoke
---
- launchApp
```

```bash
maestro test --include-tags ci .maestro/
maestro test --exclude-tags wip .maestro/
```

For CI, build the app artifact first, then run local Maestro or upload to Maestro Cloud:

```yaml
- uses: actions/setup-java@v4
  with:
    java-version: '17'
    distribution: 'temurin'

- name: Build Android APK
  run: |
    cd apps/mobile
    npx expo prebuild --platform android --no-install
    cd android && ./gradlew assembleRelease

- name: Run Maestro Cloud Tests
  uses: mobile-dev-inc/action-maestro-cloud@v2
  with:
    api-key: ${{ secrets.MAESTRO_API_KEY }}
    app-file: apps/mobile/android/app/build/outputs/apk/release/app-release.apk
    workspace: .maestro
    include-tags: ci
```

Maestro Cloud is useful when local simulators are unavailable, for real-device coverage, and for iOS CI outside a local macOS setup.

## Common Failures

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Java runtime missing | `JAVA_HOME` not set | Install OpenJDK 17 and export `JAVA_HOME` |
| Element not found after tap | Native dialog blocks UI | Add optional dialog dismissal |
| OTP digits do not enter | Auto-focus moved input | Tap each `otp-input-N` before typing |
| Test passes but action did not happen | `optional: true` hides failure | Remove optional from required actions |
| Visibility assertion fails | Element not rendered or wrong selector | Inspect hierarchy and wait for stable marker |
| Script output empty | Used browser JS APIs | Use GraalJS `http.get` and `json` |
| Auth state inconsistent | iOS Keychain persists | Use auth-loaded and adaptive flows |
| iOS kAX error on launch | Cold boot accessibility race | Add the post-launch short swipe |
| Loading or empty screens | Backend is unavailable | Start mock or real API server |

## New Test Checklist

```text
[ ] Existing project flow/style inspected
[ ] App ID confirmed
[ ] Selector strategy chosen
[ ] Required testIDs added or existing text selectors reused
[ ] Auth pre-flight included when auth exists
[ ] iOS post-launch swipe included for cold boot flows
[ ] Both relevant auth states handled
[ ] Native dialogs or permissions handled
[ ] Optimistic updates use short waits
[ ] Backend or mock API requirement documented
[ ] Reusable sub-flows used for repeated setup
[ ] Screenshots added at useful checkpoints
[ ] Tags added for CI filtering when applicable
[ ] Flow was run, or unavailable runtime was reported
```
