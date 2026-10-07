import { freshAppBeforeEach, expect, test } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

test('material top tabs survive a native-stack push and pop', async ({
  app,
  screen,
}) => {
  await openExample(app, screen, 'MaterialTopBarExample');
  await expect(
    screen.getByTestId('material-top-bar-pre-auth-screen')
  ).toBeVisible();

  await screen.getByTestId('material-top-bar-login-button').tap();
  await expect(
    screen.getByTestId('material-top-bar-post-auth-screen')
  ).toBeVisible();
  await expect(screen.getByTestId('material-top-bar-tab-1')).toBeVisible();
  await expect(screen.getByText('Tab1')).toBeVisible();

  await screen.getByTestId('material-top-bar-scroll-list-button').tap();
  await expect(
    screen.getByTestId('material-top-bar-list-item-30')
  ).toBeVisible();

  await screen.getByTestId('material-top-bar-open-detail-button').tap();
  await expect(
    screen.getByTestId('material-top-bar-detail-screen')
  ).toBeVisible();

  await screen.getByTestId('material-top-bar-back-button').tap();
  await expect(screen.getByTestId('material-top-bar-tab-1')).toBeVisible();
  // The native host must keep the FlatList scroll position across the cover/reveal cycle.
  await expect(
    screen.getByTestId('material-top-bar-list-item-30')
  ).toBeVisible();

  await screen.getByText('Tab2').tap();
  await expect(screen.getByTestId('material-top-bar-tab-2')).toBeVisible();
  await expect(
    screen.getByTestId('material-top-bar-logout-button')
  ).toBeVisible();

  await screen.getByTestId('material-top-bar-logout-button').tap();
  await expect(
    screen.getByTestId('material-top-bar-pre-auth-screen')
  ).toBeVisible();
  await expect(
    screen.getByTestId('material-top-bar-login-button')
  ).toBeVisible();
});
