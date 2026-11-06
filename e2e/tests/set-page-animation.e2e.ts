import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { App, Screen } from './support/test.ts';
import { openExample, restoreLtrAfterEach } from './support/app.ts';
import type { LayoutDirection } from './support/app.ts';

freshAppBeforeEach();

const options = { tags: ['set-page-animation'] };

async function openSetPageAnimation(
  app: App,
  screen: Screen,
  direction: LayoutDirection = 'ltr'
): Promise<void> {
  await openExample(app, screen, 'example-set-page-animation', direction);
  // iOS 18 also reports idle once a right-to-left pager has laid out.
  await expect(screen.getByTestId('set-page-animation-events')).toContainText(
    'selected:0'
  );
}

/** Only Android reports `settling` for a `setPage`, see the docs. */
function slideEvents(platform: string, page: number): string {
  return platform === 'android'
    ? `settling selected:${page} idle`
    : `selected:${page} idle`;
}

for (const direction of ['ltr', 'rtl'] as const) {
  test.describe(direction, () => {
    if (direction === 'rtl') {
      restoreLtrAfterEach();
    }

    test(
      `direct setPage selects only the target page (${direction})`,
      options,
      async ({ app, screen, platform }) => {
        await openSetPageAnimation(app, screen, direction);

        await screen.getByTestId('set-page-animation-direct-last').tap();
        await expect(
          screen.getByTestId('set-page-animation-events')
        ).toHaveText(slideEvents(platform, 7));
        await expect(
          screen.getByTestId('set-page-animation-page-7')
        ).toBeVisible();

        await screen.getByTestId('set-page-animation-direct-first').tap();
        await expect(
          screen.getByTestId('set-page-animation-events')
        ).toHaveText(slideEvents(platform, 0));
        await expect(
          screen.getByTestId('set-page-animation-page-0')
        ).toBeVisible();
      }
    );
  });
}

test(
  'the page next to the target is selectable after a direct setPage',
  options,
  async ({ app, screen, platform }) => {
    await openSetPageAnimation(app, screen);

    await screen.getByTestId('set-page-animation-direct-last').tap();
    // Page 7 is visible while it slides in, and a swipe then cuts the slide short.
    await expect(screen.getByTestId('set-page-animation-events')).toHaveText(
      slideEvents(platform, 7)
    );

    await screen
      .getByTestId('set-page-animation-page-7')
      .swipe({ direction: 'left', momentum: 'fast' });
    await expect(screen.getByTestId('set-page-animation-events')).toContainText(
      'selected:6'
    );
    await expect(screen.getByTestId('set-page-animation-page-6')).toBeVisible();
  }
);

test(
  'scroll setPage passes the pages in between, direct setPage does not',
  options,
  async ({ app, screen, platform }) => {
    await openSetPageAnimation(app, screen);
    const passed = screen.getByTestId('set-page-animation-passed');

    await screen.getByTestId('set-page-animation-scroll-last').tap();
    await expect(screen.getByTestId('set-page-animation-events')).toHaveText(
      slideEvents(platform, 7)
    );
    // From the start, unlike a jump to three pages short of the target. A page
    // can pass between two onPageScroll events, so not every one is required.
    await expect(passed).toHaveText(/passed: [12](,\d){3,}$/);

    await screen.getByTestId('set-page-animation-direct-first').tap();
    await expect(screen.getByTestId('set-page-animation-events')).toHaveText(
      slideEvents(platform, 0)
    );
    // At most the target's neighbour, which the slide starts from.
    await expect(passed).toHaveText(/passed: (none|1)$/);
  }
);
