import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { Screen } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

async function expectStatus(
  screen: Screen,
  page: number,
  rerenders: number
): Promise<void> {
  await expect(screen.getByTestId('memo-pages-status')).toHaveText(
    `Page: ${page} | Re-renders: ${rerenders}`
  );
}

async function expectRenders(screen: Screen, page: number): Promise<void> {
  await expect(screen.getByTestId(`memo-pages-renders-${page}`)).toHaveText(
    'renders: 1'
  );
}

test('memoized pages do not re-render with the pager', async ({
  device,
  app,
  screen,
}) => {
  await openExample(device, app, screen, 'example-memo-pages');
  await expectStatus(screen, 0, 0);
  await expectRenders(screen, 0);

  await screen.getByTestId('memo-pages-rerender').tap();
  await screen.getByTestId('memo-pages-rerender').tap();
  await expectStatus(screen, 0, 2);
  await expectRenders(screen, 0);

  await screen.getByTestId('memo-pages-next').tap();
  await expectStatus(screen, 1, 2);
  await expectRenders(screen, 1);

  await screen
    .getByTestId('memo-pages-page-1')
    .swipe({ direction: 'left', momentum: 'fast' });
  await expectStatus(screen, 0, 2);
  await expectRenders(screen, 0);
});
