import { expect } from './test.ts';
import type { App, Screen, ScrollDirection } from './test.ts';
import { openExample } from './app.ts';
import type { LayoutDirection } from './app.ts';

export type Orientation = 'horizontal' | 'vertical';

/** Opens the basic example for the orientation and waits for its first page. */
export async function openBasicPager(
  app: App,
  screen: Screen,
  orientation: Orientation,
  direction: LayoutDirection = 'ltr'
): Promise<void> {
  await openExample(app, screen, `example-basic-${orientation}`, direction);
  await expect(screen.getByTestId(`pager-view-${orientation}`)).toBeVisible();
  await expect(screen.getByTestId('pageNumber0')).toBeVisible();
}

/**
 * Swipes the pager towards the next page twice: once with scrolling disabled,
 * which must keep page 0, and once enabled, which must land on page 1.
 */
export async function verifySwipeToNextPage(
  screen: Screen,
  orientation: Orientation,
  direction: ScrollDirection
): Promise<void> {
  const pager = screen.getByTestId(`pager-view-${orientation}`);
  const scrollToggle = screen.getByTestId('scroll-enabled-button');

  await scrollToggle.tap();
  await pager.swipe({ direction, momentum: 'fast' });
  await expect(screen.getByTestId('pageNumber0')).toBeVisible();
  await expect(screen.getByTestId('pageNumber1')).toBeHidden();

  await scrollToggle.tap();
  await pager.swipe({ direction, momentum: 'fast' });
  await expect(screen.getByTestId('pageNumber1')).toBeVisible();
}

/** Drives the navigation panel buttons starting from page 1. */
export async function verifyControls(screen: Screen): Promise<void> {
  await screen.getByTestId('next-page-button').tap();
  await expect(screen.getByTestId('pageNumber2')).toBeVisible();

  await screen.getByTestId('prev-page-button').tap();
  await expect(screen.getByTestId('pageNumber1')).toBeVisible();

  await screen.getByTestId('start-page-button').tap();
  await expect(screen.getByTestId('pageNumber0')).toBeVisible();

  await screen.getByTestId('last-page-button').tap();
  await expect(screen.getByTestId('pageNumber9')).toBeVisible();

  await screen.getByTestId('remove-page-button').tap();
  await expect(screen.getByTestId('pageNumber8')).toBeVisible();

  await screen.getByTestId('add-page-button').tap();
  await screen.getByTestId('next-page-button').tap();
  await expect(screen.getByTestId('pageNumber9')).toBeVisible();
}
