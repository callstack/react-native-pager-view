import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { App, Screen } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

async function openLazyExample(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Lazy PagerView Example');
  await expect(screen.getByText('Mounted page 1')).toBeVisible();
  await expectMounted(screen, 2);
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
  await expect(screen.getByText('Mounted page 20')).toBeVisible();
  await expectMounted(screen, 4);

  await screen.getByTestId('lazy-prev-page-button').tap();
  await expect(screen.getByText('Mounted page 19')).toBeVisible();
  await expectMounted(screen, 5);
});

test('swiping mounts the next neighbour', async ({ app, screen }) => {
  await openLazyExample(app, screen);

  await screen
    .getByText('Mounted page 1')
    .swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByText('Mounted page 2')).toBeVisible();
  await expectMounted(screen, 3);

  await screen
    .getByText('Mounted page 2')
    .swipe({ direction: 'left', momentum: 'fast' });
  await expect(screen.getByText('Mounted page 1')).toBeVisible();
  await expectMounted(screen, 3);
});

test('preload distance 0 mounts only the pages visited', async ({
  app,
  screen,
}) => {
  await openLazyExample(app, screen);
  await screen.getByTestId('lazy-preload-0').tap();

  await screen.getByTestId('lazy-next-page-button').tap();
  await expect(screen.getByText('Mounted page 2')).toBeVisible();
  await expectMounted(screen, 2);

  await screen.getByTestId('lazy-next-page-button').tap();
  await expect(screen.getByText('Mounted page 3')).toBeVisible();
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
  await expect(screen.getByText('Mounted page 2')).toBeVisible();
  await screen.getByTestId('lazy-prev-page-button').tap();

  await expect(screen.getByText('Page 1 row 30')).toBeVisible();
});
