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

  await screen
    .getByTestId('pager-view-content')
    .filter({ hasText: 'Horizontal page number 0' })
    .swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByText('Horizontal page number 1')).toBeVisible();

  await screen
    .getByTestId('pager-view-content')
    .filter({ hasText: 'Vertical page number 0' })
    .swipe({ direction: 'down', momentum: 'fast' });
  await expect(screen.getByText('Vertical page number 1')).toBeVisible();

  await screen
    .getByTestId('pager-view-content')
    .filter({ hasText: 'Horizontal page number 1' })
    .swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByTestId('3-rd-pager-view')).toBeVisible();
});
