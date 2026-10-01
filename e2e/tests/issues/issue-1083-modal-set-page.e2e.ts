import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

/** Opens the native-stack modal and submits, which calls setPage while the pager is covered. */
async function advanceThroughModal(screen: Screen): Promise<void> {
  await screen.getByTestId('issue-1083-open-modal').tap();
  await expect(screen.getByText('Modal screen')).toBeVisible();
  await screen.getByTestId('issue-1083-submit').tap();
}

test(
  'setPage called behind a native-stack modal lands on the requested page',
  { tags: ['regression', 'issue-1083'] },
  async ({ app, screen }) => {
    await openExample(app, screen, 'Issue #1083 Modal SetPage Repro');
    await expect(screen.getByTestId('issue-1083-requested-page')).toHaveText(
      'Last requested page: 0'
    );
    await expect(screen.getByTestId('issue-1083-page-0')).toBeVisible();

    await advanceThroughModal(screen);
    await expect(screen.getByText('Last requested page: 1')).toBeVisible();
    await expect(screen.getByTestId('issue-1083-page-1')).toBeVisible();

    await screen.getByTestId('issue-1083-advance-directly').tap();
    await expect(screen.getByText('Last requested page: 2')).toBeVisible();
    await expect(screen.getByTestId('issue-1083-page-2')).toBeVisible();

    await advanceThroughModal(screen);
    await expect(screen.getByText('Last requested page: 0')).toBeVisible();
    await expect(screen.getByTestId('issue-1083-page-0')).toBeVisible();
  }
);
