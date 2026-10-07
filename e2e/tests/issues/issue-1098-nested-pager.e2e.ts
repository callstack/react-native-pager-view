import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

test(
  'outer pager stays responsive after its page count changes around a nested pager',
  { tags: ['regression', 'issue-1098'] },
  async ({ app, screen }) => {
    await openExample(app, screen, 'Issue #1098 Nested Pager Repro');
    await expect(screen.getByTestId('issue-1098-outer-pager')).toBeVisible();
    const refresh = screen.getByTestId('issue-1098-refresh-outer-pages');
    await expect(refresh).toBeVisible();

    await refresh.tap();
    await expect(screen.getByText('Refreshes: 1')).toBeVisible();

    // Swipe on the outer page title so the gesture reaches the outer pager, not the nested one.
    await screen.getByText('Outer page: nested pagers').swipe({
      direction: 'right',
      momentum: 'fast',
    });
    await expect(screen.getByText('Outer page 2')).toBeVisible();

    await screen.getByText('Outer page 2').swipe({
      direction: 'left',
      momentum: 'fast',
    });
    await expect(screen.getByTestId('issue-1098-inner-pager')).toBeVisible();

    await refresh.tap();
    await expect(screen.getByText('Refreshes: 2')).toBeVisible();
  }
);
