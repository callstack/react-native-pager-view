import { freshAppBeforeEach, expect, test } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

test('pager inside a ScrollView keeps its page across vertical scrolls', async ({
  app,
  screen,
}) => {
  await openExample(app, screen, 'Scrollable PagerView Example');
  const pager = screen.getByTestId('pager-view');
  await expect(pager).toBeVisible();
  await expect(screen.getByTestId('scroll-view')).toBeVisible();
  await expect(screen.getByTestId('pageNumber0')).toHaveText('page number 0');

  await pager.swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByTestId('pageNumber1')).toHaveText('page number 1');

  await screen.scrollUntilVisible(screen.getByTestId('scrollable-spacer-9'), {
    direction: 'down',
  });
  await expect(screen.getByTestId('pageNumber1')).toBeHidden();

  await screen.scrollUntilVisible(screen.getByTestId('pageNumber1'), {
    direction: 'up',
  });
  await expect(screen.getByTestId('pageNumber1')).toHaveText('page number 1');

  await pager.swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByTestId('pageNumber2')).toHaveText('page number 2');
});
