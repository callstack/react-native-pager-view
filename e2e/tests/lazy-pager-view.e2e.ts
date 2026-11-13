import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { App, Screen } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

async function openLazyExample(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Lazy PagerView Example');
  await expectOnPage(screen, 1);
  await expectMounted(screen, 2);
}

// "Mounted page N" shows as soon as setPage mounts the page, before the pager
// settles on it and the buttons read the new page from onPageSelected.
async function expectOnPage(screen: Screen, page: number): Promise<void> {
  await expect(screen.getByText(`Mounted page ${page}`)).toBeVisible();
  await expect(screen.getByTestId('lazy-current-page')).toHaveText(
    `${String(page).padStart(2, '0')} / 20`
  );
}

async function expectMounted(screen: Screen, count: number): Promise<void> {
  await expect(screen.getByTestId('lazy-mounted-count')).toHaveText(
    String(count)
  );
}

test('setPage mounts the target and its neighbours only', async ({
  app,
  screen,
}) => {
  await openLazyExample(app, screen);

  await screen.getByTestId('lazy-last-page-button').tap();
  await expectOnPage(screen, 20);
  await expectMounted(screen, 4);

  await screen.getByTestId('lazy-prev-page-button').tap();
  await expectOnPage(screen, 19);
  await expectMounted(screen, 5);
});

test('swiping mounts the next neighbour', async ({ app, screen }) => {
  await openLazyExample(app, screen);

  await screen
    .getByText('Mounted page 1')
    .swipe({ direction: 'right', momentum: 'fast' });
  await expectOnPage(screen, 2);
  await expectMounted(screen, 3);

  await screen
    .getByText('Mounted page 2')
    .swipe({ direction: 'left', momentum: 'fast' });
  await expectOnPage(screen, 1);
  await expectMounted(screen, 3);
});

test('preload distance 0 mounts only the pages visited', async ({
  app,
  screen,
}) => {
  await openLazyExample(app, screen);
  await screen.getByTestId('lazy-preload-0').tap();

  await screen.getByTestId('lazy-next-page-button').tap();
  await expectOnPage(screen, 2);
  await expectMounted(screen, 2);

  await screen.getByTestId('lazy-next-page-button').tap();
  await expectOnPage(screen, 3);
  await expectMounted(screen, 3);
});

test('a visited page keeps its scroll position', async ({ app, screen }) => {
  await openLazyExample(app, screen);
  await screen
    .getByTestId('lazy-page-scroll-0')
    .scrollUntilVisible(screen.getByText('Page 1 row 30'), {
      direction: 'down',
    });

  await screen.getByTestId('lazy-next-page-button').tap();
  await expectOnPage(screen, 2);
  await screen.getByTestId('lazy-prev-page-button').tap();

  await expect(screen.getByText('Page 1 row 30')).toBeVisible();
});
