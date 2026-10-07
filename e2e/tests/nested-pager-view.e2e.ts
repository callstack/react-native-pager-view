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

  // A slow drag, not a fling: on Android the inner pager blocks the outer
  // one a frame after touch down, so a first move past touch slop goes to
  // the outer pager. Travel past half the page so it lands without a fling.
  const box = await innerHorizontal.boundingBox();
  if (!box) throw new Error('nested-horizontal-pager has no bounds');
  const y = box.y + box.height / 2;
  await screen.swipe({
    from: { x: box.x + box.width * 0.85, y },
    to: { x: box.x + box.width * 0.15, y },
    duration: 2000,
  });
  await expect(screen.getByText('Horizontal page number 1')).toBeVisible();
  await expect(screen.getByText('Vertical page number 0')).toBeVisible();

  await innerVertical.swipe({ direction: 'down', momentum: 'fast' });
  await expect(screen.getByText('Vertical page number 1')).toBeVisible();
  await expect(screen.getByText('Horizontal page number 1')).toBeVisible();

  // At its last page the inner pager hands the gesture to the outer one.
  await innerHorizontal.swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByTestId('3-rd-pager-view')).toBeVisible();
});
