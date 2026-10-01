import { freshAppBeforeEach, expect, test } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

test('TabView inside a ScrollView swipes tabs and scrolls the page', async ({
  app,
  screen,
}) => {
  await openExample(app, screen, 'TabView inside ScrollView Example');
  const scrollView = screen.getByTestId('tab-view-scroll-view');
  await expect(scrollView).toBeVisible();
  await expect(screen.getByText('First')).toBeVisible();
  await expect(screen.getByText('Second')).toBeVisible();
  await expect(screen.getByText('First Route')).toBeVisible();

  // The route views extend below the screen, so swipe on the ScrollView, whose
  // vertical centre lies inside the TabView pager.
  await scrollView.swipe({ direction: 'right', momentum: 'fast' });
  await expect(screen.getByText('Second Route')).toBeVisible();

  // Scroll the ScrollView node, not the viewport: on a short screen the
  // viewport centre lands inside the TabView pager, which can swallow the
  // gesture.
  const secondRouteBottom = screen.getByTestId('tab-view-second-route-bottom');
  await scrollView.scrollUntilVisible(secondRouteBottom, { direction: 'down' });
  await expect(secondRouteBottom).toBeVisible();

  // Scroll back until the tab bar itself is on screen: stopping at the route
  // text can leave the tabs just above the viewport after a long fling.
  // TabView stacks two copies of a tab label for its crossfade, so a bare
  // getByText is LOCATOR_AMBIGUOUS; both copies share the tab's box.
  await scrollView.scrollUntilVisible(screen.getByText('First').first(), {
    direction: 'up',
  });
  await expect(screen.getByText('Second Route')).toBeVisible();

  await screen.getByText('First').first().tap();
  await expect(screen.getByText('First Route')).toBeVisible();
});
