import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: the Compose pager stopped the nested scroll of a list in a
// RefreshControl before it reached a native parent outside the pager.
const options = { tags: ['regression', 'issue-1249'], platforms: ['android'] };

test(
  'a refreshable list in a page collapses a native header outside the pager',
  options,
  async ({ device, app, screen }) => {
    await openExample(
      device,
      app,
      screen,
      'Issue #1249 Nested Scroll Forwarding Repro'
    );
    await expect(screen.getByTestId('issue-1249-header')).toBeVisible();

    await screen.getByTestId('issue-1249-list').swipe({ direction: 'down' });
    await expect(screen.getByTestId('issue-1249-header')).toBeHidden();

    await screen.getByTestId('issue-1249-list').swipe({ direction: 'down' });
    await expect(screen.getByTestId('issue-1249-status')).toHaveText(
      'List scrolled: yes'
    );
  }
);
