import { freshAppBeforeEach, test } from './support/test.ts';
import {
  expectActivePage,
  openBasicPager,
  verifyControls,
  verifySwipeToNextPage,
} from './support/basic-pager.ts';

freshAppBeforeEach();

test.describe('basic pager', { tags: ['basic-pager'] }, () => {
  test.describe('in LTR', () => {
    // The panel buttons call setPage from JS, the same in every orientation
    // and direction, so only this test drives them.
    test('pages horizontally', async ({ device, app, screen }) => {
      await openBasicPager(device, app, screen, 'horizontal');
      await verifySwipeToNextPage(screen, 'horizontal', 'right');
      await verifyControls(screen);
    });

    test('pages vertically', async ({ device, app, screen }) => {
      await openBasicPager(device, app, screen, 'vertical');
      await verifySwipeToNextPage(screen, 'vertical', 'down');
      await expectActivePage(screen, 1);
    });
  });

  test.describe('in RTL', () => {
    test('pages horizontally with the reversed gesture', async ({
      device,
      app,
      screen,
    }) => {
      await openBasicPager(device, app, screen, 'horizontal', 'rtl');
      await verifySwipeToNextPage(screen, 'horizontal', 'left');
      await expectActivePage(screen, 1);
    });
  });
});
