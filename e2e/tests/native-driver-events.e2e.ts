import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { App, Screen } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

// The track is three indicator widths, one per page. Measuring it keeps the
// step in the same units as boundingBox(): points on iOS, pixels on Android.
const PAGES = 3;

type Rest = { x: number; step: number };

async function openNativeDriverEvents(app: App, screen: Screen): Promise<Rest> {
  await openExample(app, screen, 'Native Driver Events Example');
  await expect(screen.getByText('Page 0')).toBeVisible();
  const track = await screen.getByTestId('native-driver-track').boundingBox();
  if (!track) throw new Error('native-driver-track has no bounds');
  return { x: await indicatorX(screen), step: track.width / PAGES };
}

async function indicatorX(screen: Screen): Promise<number> {
  const box = await screen.getByTestId('native-driver-indicator').boundingBox();
  if (!box) throw new Error('native-driver-indicator has no bounds');
  return box.x;
}

async function expectIndicatorOnPage(
  screen: Screen,
  rest: Rest,
  page: number
): Promise<void> {
  const expected = rest.x + page * rest.step;
  await expect
    .poll(async () => Math.abs((await indicatorX(screen)) - expected), {
      timeout: 5_000,
    })
    .toBeLessThanOrEqual(rest.step * 0.05);
}

test.describe(
  'native driver events',
  { tags: ['native-driver-events'] },
  () => {
    test('setPage through the Animated ref drives the native value', async ({
      app,
      screen,
    }) => {
      const rest = await openNativeDriverEvents(app, screen);

      await screen.getByTestId('native-driver-page-2').tap();
      await expect(screen.getByText('Page 2')).toBeVisible();
      await expectIndicatorOnPage(screen, rest, 2);

      await screen.getByTestId('native-driver-page-0').tap();
      await expect(screen.getByText('Page 0')).toBeVisible();
      await expectIndicatorOnPage(screen, rest, 0);
    });

    test('a swipe drives the native value', async ({ app, screen }) => {
      const rest = await openNativeDriverEvents(app, screen);

      await screen
        .getByTestId('native-driver-pager')
        .swipe({ direction: 'right', momentum: 'fast' });
      await expect(screen.getByText('Page 1')).toBeVisible();
      await expectIndicatorOnPage(screen, rest, 1);
    });
  }
);
