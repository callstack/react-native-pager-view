import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

test(
  'a pager remounted after its screen was covered starts on its own initialPage',
  { tags: ['regression', 'pr-1194'] },
  async ({ app, screen }) => {
    await openExample(app, screen, 'PR #1194 Remount InitialPage Repro');
    await expect(screen.getByTestId('pr-1194-page-0')).toBeVisible();

    await screen.getByTestId('pr-1194-go-to-2').tap();
    await expect(screen.getByTestId('pr-1194-page-2')).toBeVisible();

    // Covering the screen makes react-native-screens save its Fragment view
    // state, which used to include the pager's current page.
    await screen.getByTestId('pr-1194-open-cover').tap();
    await expect(screen.getByText('Cover screen')).toBeVisible();
    await screen.getByTestId('pr-1194-close-cover').tap();
    await expect(screen.getByTestId('pr-1194-page-2')).toBeVisible();

    await screen.getByTestId('pr-1194-remount').tap();
    await expect(screen.getByTestId('pr-1194-label')).toHaveText(
      'Mount 1, initialPage 1'
    );
    await expect(screen.getByTestId('pr-1194-page-1')).toBeVisible();
    await expect(screen.getByTestId('pr-1194-page-2')).toBeHidden();
  }
);
