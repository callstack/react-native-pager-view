import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { Screen } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

/** Waits for the onPageSelected alert for a 1-based page and dismisses it. */
async function acceptPageAlert(screen: Screen, page: number): Promise<void> {
  await expect(screen.getByText(`You are on ${page} page`)).toBeVisible();
  await expect(screen.getByText('Hey')).toBeVisible();
  await screen.getByRole('button', { name: 'OK' }).tap();
}

test('onPageSelected fires an alert for every page change', async ({
  app,
  screen,
}) => {
  await openExample(app, screen, 'OnPageSelected Example');
  await acceptPageAlert(screen, 1);
  await expect(screen.getByTestId('pager')).toBeVisible();
  await expect(screen.getByText('Page Index: 0')).toBeVisible();

  await screen.getByTestId('next-page-button').tap();
  await acceptPageAlert(screen, 2);
  await expect(screen.getByText('Page Index: 1')).toBeVisible();

  await screen.getByTestId('last-page-button').tap();
  await acceptPageAlert(screen, 10);
  await expect(screen.getByText('Page Index: 9')).toBeVisible();

  await screen.getByTestId('prev-page-button').tap();
  await acceptPageAlert(screen, 9);
  await expect(screen.getByText('Page Index: 8')).toBeVisible();
});
