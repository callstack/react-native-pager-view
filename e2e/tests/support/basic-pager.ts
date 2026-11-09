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

/**
 * Waits for the navigation panel to count the page as active. Its buttons step
 * from the page onPageSelected reported, which only arrives once the pager
 * settles, so a tap before then is ignored or starts from the previous page.
 */
export async function expectActivePage(
  screen: Screen,
  page: number,
  pageCount = 10
): Promise<void> {
  const pad = (value: number) => String(value).padStart(2, '0');
  await expect(
    screen.getByText(`${pad(page + 1)} / ${pad(pageCount)}`)
  ).toBeVisible();
}

/** Drives the navigation panel buttons starting from page 1. */
export async function verifyControls(screen: Screen): Promise<void> {
  await expectActivePage(screen, 1);

  await screen.getByTestId('next-page-button').tap();
  await expect(screen.getByTestId('pageNumber2')).toBeVisible();
  await expectActivePage(screen, 2);

  await screen.getByTestId('prev-page-button').tap();
  await expect(screen.getByTestId('pageNumber1')).toBeVisible();
  await expectActivePage(screen, 1);

  await screen.getByTestId('start-page-button').tap();
  await expect(screen.getByTestId('pageNumber0')).toBeVisible();
  await expectActivePage(screen, 0);

  await screen.getByTestId('last-page-button').tap();
  await expect(screen.getByTestId('pageNumber9')).toBeVisible();
  await expectActivePage(screen, 9);

  await screen.getByTestId('remove-page-button').tap();
  await expect(screen.getByTestId('pageNumber8')).toBeVisible();
  await expectActivePage(screen, 8, 9);

  await screen.getByTestId('add-page-button').tap();
  await expectActivePage(screen, 8);
  await screen.getByTestId('next-page-button').tap();
  await expect(screen.getByTestId('pageNumber9')).toBeVisible();
}
