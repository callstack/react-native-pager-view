import { freshAppBeforeEach, test } from './support/test.ts';
import { restoreLtrAfterEach } from './support/app.ts';
import {
  openBasicPager,
  verifyControls,
  verifySwipeToNextPage,
} from './support/basic-pager.ts';

freshAppBeforeEach();

test.describe('basic pager', { tags: ['basic-pager'] }, () => {
  test.describe('in LTR', () => {
    test('pages horizontally', async ({ app, screen }) => {
      await openBasicPager(app, screen, 'horizontal');
      await verifySwipeToNextPage(screen, 'horizontal', 'right');
      await verifyControls(screen);
    });

    test('pages vertically', async ({ app, screen }) => {
      await openBasicPager(app, screen, 'vertical');
      await verifySwipeToNextPage(screen, 'vertical', 'down');
      await verifyControls(screen);
    });
  });

  test.describe('in RTL', () => {
    restoreLtrAfterEach();

    test('pages horizontally with the reversed gesture', async ({
      app,
      screen,
    }) => {
      await openBasicPager(app, screen, 'horizontal', 'rtl');
      await verifySwipeToNextPage(screen, 'horizontal', 'left');
      await verifyControls(screen);
    });
  });
});
