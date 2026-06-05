---
name: maestro-mobile-testing
description: "Maestro mobile E2E testing patterns for React Native/Expo apps: YAML test flows, testID selectors, adaptive auth state, optimistic update verification, GraalJS scripting, cross-platform stability, CI/CD integration, Maestro Cloud, and MCP server integration"
version: 1.1.0
category: toolchain
author: tovimx
license: MIT
progressive_disclosure:
  entry_point:
    summary: "Write reliable Maestro mobile E2E tests with declarative YAML flows, testID selectors, auth-aware adaptive patterns, and optimistic update verification"
    when_to_use: "When writing mobile E2E tests, debugging flaky flows, testing authentication, verifying optimistic updates, capturing screenshots, or setting up Maestro CI for React Native/Expo apps"
    quick_start: "1. Install Maestro CLI 2. Add testID props to components 3. Write YAML flows with testID selectors 4. Use auth-loaded pre-flight pattern 5. Start mock API server for backend-dependent tests 6. Run with maestro test"
  token_estimate:
    entry: 150
    full: 9000
context_limit: 900
tags:
  - react-native
  - expo
  - testing
  - maestro
  - e2e
  - mobile
  - ios
  - android
  - yaml
  - ci-cd
  - mcp
requires_tools: []
---

# Maestro Mobile E2E Testing

## Overview

Maestro is a declarative YAML-based mobile E2E testing framework. It provides automatic waiting, built-in retry logic, and fast execution without boilerplate. It's more stable than Detox or Appium for React Native apps.

### Key Features

- **Declarative YAML** — no imperative test code, just steps
- **Automatic waiting** — no manual `sleep()` or flaky waits
- **Built-in retry** — reduces test flakiness
- **Fast execution** — runs quickly without setup overhead
- **Maestro Studio** — interactive test builder (`maestro studio`)
- **Sub-flows** — reusable YAML sequences for DRY tests
- **JavaScript scripting** — GraalJS runtime for HTTP calls and data manipulation
- **Maestro Cloud** — real device testing in CI without local simulators

## Quick Start

### Install

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
brew install openjdk@17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

### Minimal test

```yaml
appId: com.myapp
---
- launchApp
- tapOn:
    id: "my-button"
- assertVisible: "Expected Text"
```

### Run

```bash
maestro test .maestro/smoke-test.yaml
maestro test --debug .maestro/smoke-test.yaml  # step through
maestro studio                                  # interactive builder
```

---

## Core Patterns

### 1. Selector Strategy: testID vs Text

Choose your selector approach based on project context. Both are valid — the right choice depends on whether your app is localized and your team's testing philosophy.

| Context | Recommended Selector | Rationale |
|---------|---------------------|-----------|
| **Multi-language / i18n** | `id:` (testID) | Stable across translations |
| **Single language** | Text labels | Human-readable, self-documenting tests |
| **Agent-maintained tests** | Either — ask the developer | Readability matters less for AI-maintained flows |
| **System dialogs** | Text (always) | No testID possible on native alerts |

```yaml
# testID selector — stable across translations
- tapOn:
    id: "submit-button"

# Text selector — human-readable, self-documenting
- tapOn: "Submit"
```

**When to prefer testIDs:**
- App supports multiple languages or will be translated
- UI text is dynamic or frequently changes
- Multiple elements share the same visible text

**When to prefer text selectors:**
- Single-language app with stable copy
- Readability and self-documentation are a priority
- Testing user-visible behavior exactly as it appears

In React Native, add `testID` props when using ID-based selectors:

```tsx
<TouchableOpacity testID="submit-button" onPress={handleSubmit}>
  <Text>{t('submit')}</Text>
</TouchableOpacity>
```

### testID Naming Convention

When using ID-based selectors:

```
{component}-{action/type}[-{variant}]

Examples:
- auth-prompt-login-button
- product-card-{id}
- otp-input-0
- tab-home
- dashboard-loading
```

### 2. Auth Pre-Flight Pattern

Prevent race conditions where Maestro interacts with the UI before auth state resolves. Add a zero-size `auth-loaded` marker that only renders when auth loading completes:

```tsx
// In your tab bar or root layout
{!isLoading && <View testID="auth-loaded" style={{ width: 0, height: 0 }} />}
```

Then in every test:

```yaml
- launchApp

# Prevent XCTest crash on cold boot (iOS)
- swipe:
    direction: DOWN
    duration: 100

# Wait for auth state to resolve
- extendedWaitUntil:
    visible:
      id: "auth-loaded"
    timeout: 15000

# Now safe to interact
- tapOn:
    id: "tab-home"
```

### 3. Adaptive Tests (Handle Both Auth States)

Tests should work regardless of whether the user is authenticated:

```yaml
# Auth flow — only runs if login prompt is visible
- runFlow:
    when:
      visible: "Sign In"
    file: flows/auth-flow.yaml

# Already authenticated — proceed directly
- runFlow:
    when:
      visible:
        id: "tab-home"
    file: flows/authenticated-action.yaml
```

### 4. Testing Optimistic Updates

Use short timeouts to verify UI changes happen before server response:

```yaml
# Trigger mutation
- tapOn:
    id: "action-button"

# OPTIMISTIC: UI must change within 3s (not waiting for server)
- extendedWaitUntil:
    visible:
      id: "undo-button"
    timeout: 3000

# Verify derived UI state
- extendedWaitUntil:
    visible:
      id: "user-indicator"
    timeout: 5000
```

| Action | Expected Change | Timeout |
|--------|----------------|---------|
| Mutation trigger | Button state flips | < 3s |
| List update | Item appears/disappears | < 5s |
| Re-do action | Proves persistence | < 3s |

### 5. Dismissing Native Alerts

React Native `Alert.alert()` creates native dialogs that block the UI:

```yaml
- tapOn:
    id: "action-button"

# Wait for expected state change first
- extendedWaitUntil:
    visible:
      id: "new-state-element"
    timeout: 5000

# Dismiss alert (optional in case it already closed)
- tapOn:
    text: "OK"
    optional: true

# Brief delay for alert animation
- swipe:
    direction: DOWN
    duration: 300
```

### 6. Sub-Flows for Reusability

Break repeated sequences into sub-flow files:

```
.maestro/
├── flows/
│   ├── auth-and-return.yaml
│   ├── complete-purchase.yaml
│   └── verify-result.yaml
├── smoke-test.yaml
└── feature-test.yaml
```

```yaml
# In main test
- runFlow:
    file: flows/auth-and-return.yaml
```

### 7. Deep Links (Expo)

Use the Expo scheme from `app.json`, not the bundle ID:

```yaml
# WRONG
- openLink: "com.myapp://profile/settings"

# CORRECT
- openLink: "myapp://profile/settings"
```

Deep links must be registered in your app's deep link handler. Unregistered routes silently fail.

### 8. Platform-Specific Logic

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

### 9. Environment Variables

```yaml
appId: com.myapp
env:
  TEST_EMAIL: maestro-test@example.com
  API_BASE_URL: http://localhost:3000
---
- inputText: ${TEST_EMAIL}
```

### 10. Selector State Properties

Use `enabled`, `selected`, `checked`, and `focused` to target elements by their current state. This is useful for validating interactive element states before or after actions.

```yaml
# Only tap the submit button if it's enabled
- tapOn:
    id: "submit-button"
    enabled: true

# Assert a checkbox is checked
- assertVisible:
    id: "terms-checkbox"
    checked: true

# Wait for an input to be focused
- extendedWaitUntil:
    visible:
      id: "email-input"
      focused: true
    timeout: 3000
```

| Property | Values | Use Case |
|----------|--------|----------|
| `enabled` | `true` / `false` | Buttons that disable during submission or until form is valid |
| `checked` | `true` / `false` | Checkboxes, toggle switches |
| `selected` | `true` / `false` | Tab items, segmented controls |
| `focused` | `true` / `false` | Input fields with auto-focus |

### 11. Relative Position Selectors

Distinguish between similar elements by their spatial relationship to other elements. This is more idiomatic and resilient than index-based selection.

```yaml
# BAD — fragile, breaks if order changes
- tapOn:
    text: "Add to Basket"
    index: 1

# GOOD — contextual, self-documenting
- tapOn:
    text: "Add to Basket"
    below:
      text: "Awesome Shoes"
```

Available relative selectors:

```yaml
# Target element below another
- tapOn:
    text: "Buy Now"
    below: "Product Title"

# Target element that is a child of a parent
- tapOn:
    text: "Delete"
    childOf:
      id: "item-card-42"

# Target a parent that contains a specific child
- tapOn:
    containsChild: "Urgent"

# Target by multiple descendants
- tapOn:
    containsDescendants:
      - id: title_id
        text: "Specific Title"
      - "Another descendant text"

# Horizontal positioning
- tapOn:
    text: "Edit"
    rightOf: "Username"
```

| Selector | Meaning |
|----------|---------|
| `below:` | Element is positioned below the referenced element |
| `above:` | Element is positioned above the referenced element |
| `leftOf:` | Element is to the left of the referenced element |
| `rightOf:` | Element is to the right of the referenced element |
| `childOf:` | Element is a direct child of the referenced parent |
| `containsChild:` | Element contains a direct child matching the reference |
| `containsDescendants:` | Element contains all specified descendant elements |

---

## Authentication Testing

### Architecture

Testing OTP or magic-link authentication in E2E requires capturing emails programmatically. The general pattern:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Maestro    │────▶│  Auth        │────▶│  Email Capture  │
│  Test       │     │  Provider    │     │  Service        │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                                        │
       │         ┌──────────────────────────────┘
       │         ▼
       │   ┌─────────────┐
       └──▶│  REST API   │ ─── GET /api/v1/messages
           │  (email)    │ ─── Extract OTP code
           └─────────────┘
```

Common email capture services: [Mailpit](https://github.com/axllent/mailpit), [MailHog](https://github.com/mailhog/MailHog), [Ethereal](https://ethereal.email/).

### OTP Fetch Script

Fetch OTP codes from your email capture service using Maestro's GraalJS runtime:

```javascript
// CRITICAL: Maestro uses GraalJS — NO async/await, NO fetch()
var email = typeof EMAIL !== "undefined" ? EMAIL : "test@example.com";
var emailServiceUrl = typeof EMAIL_SERVICE_URL !== "undefined"
  ? EMAIL_SERVICE_URL : "http://localhost:8025";

var response = http.get(emailServiceUrl + "/api/v1/messages");
if (!response.ok) {
  throw new Error("Failed to fetch emails: " + response.status);
}

var data = json(response.body);
// Find the latest email and extract OTP code
var body = data.messages[0].Content.Body;
var match = body.match(/(\d{6})/);
output.OTP_CODE = match[1];
```

### OTP Input Strategy

OTP components with auto-focus need individual digit entry. Tap each input before typing:

```yaml
# Split OTP into digits via helper script
- runScript:
    file: scripts/split-otp.js
    env:
      OTP_CODE: ${output.OTP_CODE}

# Enter each digit by tapping its input
- tapOn:
    id: "otp-input-0"
- inputText: ${output.OTP_0}

- tapOn:
    id: "otp-input-1"
- inputText: ${output.OTP_1}
# ... repeat for all digits
```

> For provider-specific implementations (Supabase + Mailpit, Firebase Auth, Auth0), create a project-level skill that extends this one.

---

## GraalJS Script Rules

Maestro uses the GraalJS runtime. These constraints are non-negotiable:

| Feature | Status |
|---------|--------|
| `async/await` | **NOT supported** |
| `fetch()` | **NOT supported** |
| `http.get()`, `http.post()` | Use these instead |
| `json()` | Use to parse response bodies |
| `output.VAR` | Set variables for use in YAML flow |
| `var` declarations | Required (use `var`, not `const`/`let` for safety) |

```javascript
// Script template
var response = http.get("http://localhost:8025/api/endpoint");
if (!response.ok) {
  throw new Error("Request failed: " + response.status);
}
var data = json(response.body);
output.RESULT = data.value;
```

---

## Critical Gotchas

### clearState Does NOT Clear iOS Keychain

`clearState: true` clears the app sandbox (UserDefaults, files, caches) but does **NOT** clear the iOS Keychain. Auth tokens stored via `expo-secure-store` (or any Keychain-based storage) persist across `clearState` resets and even app reinstalls.

```yaml
# WRONG — user may still be authenticated
- launchApp:
    clearState: true
- assertVisible: "Welcome"  # Fails if Keychain has tokens

# CORRECT — wait for auth resolution, then adapt
- launchApp
- extendedWaitUntil:
    visible:
      id: "auth-loaded"
    timeout: 15000
```

**Rules:**
- Never rely on `clearState` to produce guest state on iOS
- For auth tests: skip `clearState`, use `auth-loaded` pre-flight
- For guest tests: use adaptive flows that handle both states
- Never assert guest-only UI after `clearState`

**Note:** On Android, `clearState: true` fully resets app data including credentials. This is an iOS-only gotcha.

### XCTest kAXErrorInvalidUIElement Crash (iOS)

The XCTest driver may crash if Maestro interacts with the accessibility tree before the first render cycle completes on cold boot.

**Fix:** Add a no-op swipe immediately after `launchApp`:

```yaml
- launchApp
- swipe:
    direction: DOWN
    duration: 100
```

### API Server Dependency

Mobile apps calling backend APIs on localhost need either the full server or a mock server running. Without it, all API-dependent screens show loading spinners or empty states (queries fail silently).

**Fix:** Start a mock API server before running Maestro tests:

```bash
# Start mock server (serves canned responses on your API port)
npx tsx scripts/mock-api-server.ts &

# Then run tests
maestro test .maestro/my-test.yaml
```

Create a lightweight mock that returns canned JSON for each endpoint your app calls. This is faster and more deterministic than running your full backend.

### Auth-Aware Tab Bars

Tab bars that show different tabs for guest vs authenticated users will cause selector failures:

| State | Typical Tabs |
|-------|-------------|
| Guest | home, search, cart, profile |
| Auth | home, feed, create, messages, profile |

Only assert tabs that exist in both states, or use adaptive `when:` conditions.

---

## Test File Template

```yaml
# {Feature} {Action} Test
#
# Tests: {what this validates}
# Prerequisites:
# - Simulator/emulator running with app installed
# - Backend or mock server running (if API-dependent)

appId: com.myapp
env:
  TEST_EMAIL: maestro-{feature}@example.com
  EMAIL_SERVICE_URL: http://localhost:8025
---
# ==========================================
# STEP 1: LAUNCH + AUTH PRE-FLIGHT
# ==========================================

- launchApp

- swipe:
    direction: DOWN
    duration: 100

- extendedWaitUntil:
    visible:
      id: "auth-loaded"
    timeout: 15000

- takeScreenshot: 01-initial-state

# ==========================================
# STEP 2: {ACTION}
# ==========================================

- tapOn:
    id: "target-element"

# ==========================================
# STEP 3: VERIFY
# ==========================================

- extendedWaitUntil:
    visible:
      id: "expected-result"
    timeout: 5000

- takeScreenshot: 02-final-state
```

---

## Folder Structure

```
.maestro/
├── README.md                    # Quick reference + testID inventory
├── config.yaml                  # Shared configuration
├── flows/                       # Reusable sub-flows
│   ├── auth-and-return.yaml
│   ├── complete-action.yaml
│   └── verify-result.yaml
├── scripts/                     # GraalJS helpers
│   ├── fetch-otp.js
│   └── split-otp.js
├── smoke-test.yaml              # Guest navigation
├── auth-signin.yaml             # OTP sign-in flow
├── feature-screenshots.yaml     # Screenshot capture flows
└── feature-action.yaml          # Feature-specific tests

scripts/
├── mock-api-server.ts           # Lightweight mock for E2E
└── run-e2e.sh                   # Orchestration script
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Main test | `{feature}-{action}.yaml` | `checkout-purchase.yaml` |
| Sub-flow | `{action}-{context}.yaml` | `auth-and-return-to-dashboard.yaml` |
| Script | `{verb}-{noun}.js` | `fetch-otp.js` |

---

## Infrastructure

### Mock Server for API-Dependent Tests

Create a lightweight mock server that serves canned responses for your API layer. This is faster and more deterministic than running your full backend during E2E tests.

```bash
# Start mock server before running Maestro tests
npx tsx scripts/mock-api-server.ts &
```

### Orchestration Script

Automate the full E2E setup with a shell script that:
1. Starts backend services (database, auth)
2. Seeds test data
3. Starts mock API server
4. Runs Maestro tests
5. Cleans up all services

```bash
bash scripts/run-e2e.sh
```

### Seed Data

Tests that depend on specific data require seeded databases. Keep seed scripts alongside your test infrastructure and run them before each test suite.

---

## Android-Specific Patterns

### Emulator Setup

Android tests require an emulator or a USB-connected physical device. Maestro auto-detects connected devices.

```bash
# List available system images
sdkmanager --list | grep system-images

# Create emulator
avdmanager create avd -n maestro_test \
  -k "system-images;android-34;google_apis;arm64-v8a"

# Start emulator
emulator -avd maestro_test
```

### iOS vs Android Differences

| Aspect | iOS | Android |
|--------|-----|---------|
| Device type | Simulator only (no physical) | Emulator + physical via ADB |
| `clearState` | Does NOT clear Keychain | Fully resets app data |
| Cold boot crash | XCTest kAXError (add swipe delay) | No equivalent issue |
| Performance | Runs natively (fast) | ARM emulation (slower on x86) |
| Permission dialogs | System alerts | System dialogs with different text |

### ADB Debugging

```bash
adb devices                                    # List connected devices
adb shell am start -n com.myapp/.MainActivity  # Launch app
adb logcat | grep Maestro                      # Filter Maestro logs
adb shell input keyevent 82                    # Unlock screen
```

### Android Permission Handling

Android permissions appear as system dialogs. Dismiss with optional taps:

```yaml
- tapOn:
    text: "Allow"
    optional: true

- tapOn:
    text: "While using the app"
    optional: true
```

---

## CI/CD Integration

### GitHub Actions with Maestro Cloud

Maestro Cloud provides real devices in CI without local simulators. Use the official action:

```yaml
name: Mobile E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  maestro-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Build Android APK
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
        id: maestro
        uses: mobile-dev-inc/action-maestro-cloud@v2
        with:
          api-key: ${{ secrets.MAESTRO_API_KEY }}
          app-file: apps/mobile/android/app/build/outputs/apk/release/app-release.apk
          workspace: .maestro
          include-tags: ci

      # Access results
      # ${{ steps.maestro.outputs.MAESTRO_CLOUD_CONSOLE_URL }}
      # ${{ steps.maestro.outputs.MAESTRO_CLOUD_UPLOAD_STATUS }}
      # ${{ steps.maestro.outputs.MAESTRO_CLOUD_FLOW_RESULTS }}
```

### Tag-Based Flow Filtering

Use tags to control which tests run in CI vs locally:

```yaml
# In your flow file header
appId: com.myapp
tags:
  - ci
  - smoke
---
- launchApp
# ... test steps
```

```bash
# Run only CI-tagged flows locally
maestro test --include-tags ci .maestro/

# Exclude work-in-progress flows
maestro test --exclude-tags wip .maestro/
```

### Local CI with Docker (Android Only)

```dockerfile
FROM openjdk:17-slim

RUN curl -Ls "https://get.maestro.mobile.dev" | bash
ENV PATH="/root/.maestro/bin:${PATH}"

COPY .maestro/ /app/.maestro/
WORKDIR /app

CMD ["maestro", "test", ".maestro/"]
```

**Note:** iOS tests cannot run in Docker (requires macOS). Use Maestro Cloud for iOS in CI.

---

## Maestro Cloud

[Maestro Cloud](https://cloud.maestro.dev/) runs tests on real devices without local simulator setup.

### Setup

1. Create account at cloud.maestro.dev
2. Generate API key from dashboard
3. Store as `MAESTRO_API_KEY` secret in your CI provider

### Running from CLI

```bash
# Upload and run on Maestro Cloud
maestro cloud --api-key $MAESTRO_API_KEY \
  --app-file ./app-release.apk \
  .maestro/

# With tag filtering
maestro cloud --api-key $MAESTRO_API_KEY \
  --app-file ./app-release.apk \
  --include-tags smoke \
  .maestro/
```

### Key Points

- **iOS testing**: Supported on Maestro Cloud (not on local physical devices)
- **Android testing**: Both local physical devices and Maestro Cloud
- **Results**: Dashboard with video recordings, logs, and screenshots
- **CI outputs**: `MAESTRO_CLOUD_CONSOLE_URL`, `MAESTRO_CLOUD_FLOW_RESULTS`

---

## Maestro MCP Server

The [Maestro MCP server](https://docs.maestro.dev/getting-started/maestro-mcp) exposes Maestro's full command set as Model Context Protocol tools, letting AI agents **execute tests and interact with devices directly** — not just write YAML.

### How It Complements This Skill

| | **This Skill** | **Maestro MCP** |
|---|---|---|
| **Role** | Teaches correct patterns | Provides runtime execution |
| **Layer** | Authoring (write good YAML) | Execution (run, tap, assert, screenshot) |
| **Output** | Better test files | Live device interaction |

Use both together: this skill ensures the AI writes correct tests; the MCP lets it run them immediately, see failures, and iterate.

### Setup

The MCP ships with the Maestro CLI — no extra install needed:

```bash
# Verify it's available
maestro mcp
```

**Claude Code** — add to project `.mcp.json` or global settings:

```json
{
  "mcpServers": {
    "maestro": {
      "command": "maestro",
      "args": ["mcp"]
    }
  }
}
```

**Claude Desktop** — add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "maestro": {
      "command": "maestro",
      "args": ["mcp"]
    }
  }
}
```

Also supported on Cursor, Windsurf, VS Code, and JetBrains IDEs. See the [Maestro MCP docs](https://docs.maestro.dev/getting-started/maestro-mcp) for IDE-specific setup.

### Key Capabilities

The MCP server exposes 47 tools organized by category:

| Category | Tools | Examples |
|----------|-------|---------|
| UI Interaction | tap, swipe, scroll, long press | `tapOn`, `scrollUntilVisible` |
| Text Input | type, erase, paste, copy | `inputText`, `eraseText` |
| Assertions | visibility, AI-powered | `assertVisible`, `assertWithAI` |
| App Lifecycle | launch, stop, clear state | `launchApp`, `clearState` |
| Device Control | location, orientation, airplane | `setLocation`, `hideKeyboard` |
| Flow Control | run flows, repeat, eval scripts | `runFlow`, `evalScript` |
| Media | screenshots, recording | `takeScreenshot`, `startRecording` |
| AI-Powered | visual assertions, defect detection | `assertWithAI`, `assertNoDefectsWithAI` |

### Write-Run-Fix Loop

With both this skill and the MCP active, the AI can:

1. **Write** a test YAML using patterns from this skill
2. **Run** it via MCP's `runFlow` / `launchApp` + interaction tools
3. **See** failures via screenshots and assertions
4. **Fix** the YAML and re-run — all in one conversation

---

## Debugging

```bash
maestro test --debug .maestro/test.yaml   # Step through interactively
maestro record .maestro/test.yaml          # Record as video
maestro studio                             # Interactive UI builder
maestro hierarchy                          # View element tree
```

Screenshots saved to `~/.maestro/tests/{timestamp}/`.

---

## Checklist for New Tests

```
[ ] Unique test email (maestro-{feature}@example.com)
[ ] Selector strategy chosen (testID for i18n apps, text for single-language — see Pattern 1)
[ ] Selectors use state properties where relevant (enabled, checked — see Pattern 10)
[ ] Similar elements distinguished with relative selectors, not index (see Pattern 11)
[ ] Auth pre-flight pattern used (auth-loaded)
[ ] Post-launch swipe added (iOS crash prevention)
[ ] Both auth states handled (adaptive flows)
[ ] Native alerts dismissed after mutations
[ ] Short timeouts for optimistic updates (3-5s)
[ ] Sub-flows created for reusable sequences
[ ] Descriptive screenshots at key points
[ ] Header comment with prerequisites
[ ] Added to README.md test table
[ ] Mock API server started if backend-dependent
[ ] Tags added for CI filtering (ci, smoke, wip)
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Unable to locate Java Runtime" | Java not in PATH | `export JAVA_HOME=/opt/homebrew/opt/openjdk@17/...` |
| "Element not found" after tap | Native alert blocking | Add `tapOn: text: "OK" optional: true` |
| OTP digits not entering | Auto-focus interference | Use individual `otp-input-N` testIDs |
| Test passes but nothing happened | `optional: true` misused | Only use optional for truly optional actions |
| "Assertion is false" on visibility | Element not rendered yet | Increase timeout or verify testID exists |
| Script output empty | Wrong JS API | Use `http.get()` not `fetch()` |
| Auth state inconsistent after clearState | iOS Keychain not cleared | Don't use `clearState`, use adaptive flows |
| kAXErrorInvalidUIElement crash | Cold boot race (iOS) | Add post-launch swipe delay |
| Loading spinners / empty screens | No API server running | Start mock API server before tests |
| Permission dialog blocking (Android) | System dialog not dismissed | Add `tapOn: text: "Allow" optional: true` |

---

## Resources

- [Maestro Documentation](https://docs.maestro.dev/)
- [Maestro Selectors Reference](https://docs.maestro.dev/api-reference/selectors)
- [Maestro Cloud](https://cloud.maestro.dev/)
- [Maestro MCP Server](https://docs.maestro.dev/getting-started/maestro-mcp)
- [Maestro GitHub](https://github.com/mobile-dev-inc/Maestro)
- [GraalJS HTTP Requests](https://docs.maestro.dev/advanced/javascript/make-http-s-requests)
- [Conditions & Adaptive Flows](https://docs.maestro.dev/advanced/conditions)
- [GitHub Actions Integration](https://docs.maestro.dev/cloud/ci-integration/github-actions)
- [BrowserStack: Maestro Testing Guide](https://www.browserstack.com/guide/maestro-testing)
- [DEV.to: Tips & Tricks for Maestro + React Native](https://dev.to/retyui/best-tips-tricks-for-e2e-maestro-with-react-native-2kaa)
