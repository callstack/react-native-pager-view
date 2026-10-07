import { freshAppBeforeEach, expect, test } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

test('nested horizontal and vertical pagers scroll independently', async ({
  app,
  screen,
}) => {
  await openExample(app, screen, 'Nested PagerView Example');
  const outerPager = screen.getByTestId('pager-view');
  await expect(outerPager).toBeVisible();
  await expect(screen.getByTestId('1-st-page')).toBeVisible();

  await outerPager.swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByText('Horizontal page number 0')).toBeVisible();

  // Swipe the inner pagers by their own nodes: a swipe on a page content
  // node of a small nested pager can fling without changing the page.
  const innerHorizontal = screen.getByTestId('nested-horizontal-pager');
  const innerVertical = screen.getByTestId('nested-vertical-pager');

  // A slow drag, not a fling: inner and outer pager share the horizontal
  // axis, and Android hands a fast fling to the outer one at times.
  await innerHorizontal.swipe({ direction: 'right', momentum: 'slow' });
  await expect(screen.getByText('Horizontal page number 1')).toBeVisible();
  await expect(screen.getByText('Vertical page number 0')).toBeVisible();

  await innerVertical.swipe({ direction: 'down', momentum: 'fast' });
  await expect(screen.getByText('Vertical page number 1')).toBeVisible();
  await expect(screen.getByText('Horizontal page number 1')).toBeVisible();

  // At its last page the inner pager hands the gesture to the outer one.
  await innerHorizontal.swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByTestId('3-rd-pager-view')).toBeVisible();
});
