import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

test(
  'FlatList inside the pager gets the search bar safe-area insets',
  // The stacked search bar is UISearchController; on Android the screen's own
  // measurement reports "safe-area: fail" because the inset never applies.
  { tags: ['regression', 'issue-1142'], platforms: ['ios'] },
  async ({ app, screen }) => {
    await openExample(app, screen, 'Issue #1142 Search Bar Inset Repro');
    await expect(screen.getByTestId('issue-1142-hub')).toBeVisible();

    await screen.getByTestId('issue-1142-open-pager').tap();
    await expect(screen.getByTestId('issue-1142-pager')).toBeVisible();

    // The screen measures the first-row and bottom-marker window positions
    // against a bare list and reports the verdict itself.
    await expect(screen.getByTestId('issue-1142-pager-verdict')).toHaveText(
      'safe-area: pass',
      { timeout: 15_000 }
    );
    await expect(screen.getByTestId('issue-1142-pager-first-row')).toBeVisible();
    await expect(
      screen.getByTestId('issue-1142-pager-bottom-marker')
    ).toBeVisible();

    await screen
      .getByTestId('issue-1142-pager')
      .swipe({ direction: 'right', momentum: 'fast' });
    await expect(screen.getByTestId('issue-1142-second-page')).toBeVisible();
  }
);
