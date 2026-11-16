import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Device, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: the Compose pager has to tell React Native when it takes the
// touch, as ScrollView does.
const options = { tags: ['regression', 'issue-424'], platforms: ['android'] };

/** Opens the repro and waits for the first page's button. */
async function openRepro(
  device: Device,
  app: App,
  screen: Screen
): Promise<void> {
  await openExample(
    device,
    app,
    screen,
    'Issue #424 Swipe Cancels Press Repro'
  );
  await expect(screen.getByTestId('issue-424-button-0')).toBeVisible();
}

test(
  'a tap on a button in a page presses it',
  options,
  async ({ device, app, screen }) => {
    await openRepro(device, app, screen);
    await screen.getByTestId('issue-424-button-0').tap();
    await expect(screen.getByTestId('issue-424-status')).toHaveText(
      'Page: 0 | Presses: 1 | Touch: end'
    );
  }
);

test(
  'a swipe that starts on a button in a page cancels its touch',
  options,
  async ({ device, app, screen }) => {
    await openRepro(device, app, screen);
    // Before the fix JS never got a cancel: the touch always ended, and it
    // could press the button when the dragging event reached JS too late.
    await screen
      .getByTestId('issue-424-button-0')
      .swipe({ direction: 'right', momentum: 'fast' });
    await expect(screen.getByTestId('issue-424-status')).toHaveText(
      'Page: 1 | Presses: 0 | Touch: cancel'
    );
  }
);

test(
  'a swipe while the JS thread is busy does not press the button',
  options,
  async ({ device, app, screen }) => {
    await openRepro(device, app, screen);
    await screen.getByTestId('issue-424-block-js').tap();
    await screen
      .getByTestId('issue-424-button-0')
      .swipe({ direction: 'right', momentum: 'fast' });
    await expect(screen.getByTestId('issue-424-status')).toHaveText(
      'Page: 1 | Presses: 0 | Touch: cancel',
      { timeout: 15_000 }
    );
  }
);
