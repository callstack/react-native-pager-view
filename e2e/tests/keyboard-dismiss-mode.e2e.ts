import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { App, Screen } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

// Focus stands in for the keyboard: Android's headless IME never reports it.
async function expectStatus(
  screen: Screen,
  mode: string,
  page: number,
  focused: boolean
): Promise<void> {
  await expect(screen.getByTestId('keyboard-dismiss-status')).toHaveText(
    `Mode: ${mode} | Page: ${page} | Focused: ${focused ? 'yes' : 'no'}`
  );
}

async function focusInput(
  app: App,
  screen: Screen,
  mode: 'none' | 'on-drag'
): Promise<void> {
  await openExample(app, screen, 'example-keyboard-dismiss-mode');
  await screen.getByTestId(`keyboard-dismiss-mode-${mode}`).tap();
  await screen.getByTestId('keyboard-dismiss-input').tap();
  await expectStatus(screen, mode, 0, true);
}

test('on-drag: dragging the pager blurs the input', async ({ app, screen }) => {
  await focusInput(app, screen, 'on-drag');

  await screen
    .getByTestId('keyboard-dismiss-label-0')
    .swipe({ direction: 'right', momentum: 'fast' });
  await expectStatus(screen, 'on-drag', 1, false);
});

test('on-drag: setPage keeps the input focused', async ({ app, screen }) => {
  await focusInput(app, screen, 'on-drag');

  await screen.getByTestId('keyboard-dismiss-next').tap();
  await expectStatus(screen, 'on-drag', 1, true);
});

test('none: dragging the pager keeps the input focused', async ({
  app,
  screen,
}) => {
  await focusInput(app, screen, 'none');

  await screen
    .getByTestId('keyboard-dismiss-label-0')
    .swipe({ direction: 'right', momentum: 'fast' });
  await expectStatus(screen, 'none', 1, true);
});
