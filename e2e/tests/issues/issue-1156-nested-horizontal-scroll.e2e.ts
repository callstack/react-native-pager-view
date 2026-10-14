import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: on iOS the inner ScrollView always got the gesture.
const options = { tags: ['regression', 'issue-1156'], platforms: ['android'] };

async function expectStatus(
  screen: Screen,
  page: number,
  chipsScrolled: boolean
): Promise<void> {
  await expect(screen.getByTestId('issue-1156-status')).toHaveText(
    `Selected: ${page} | Chips scrolled: ${chipsScrolled ? 'yes' : 'no'}`
  );
}

test(
  'a horizontal ScrollView in a page scrolls instead of the pager',
  options,
  async ({ app, screen }) => {
    await openExample(
      app,
      screen,
      'Issue #1156 Nested Horizontal Scroll Repro'
    );
    await expectStatus(screen, 0, false);

    // Before the fix the pager took the swipe and the chips never moved.
    await screen.getByTestId('issue-1156-chips').swipe({ direction: 'right' });
    await expectStatus(screen, 0, true);
  }
);

test(
  'the pager takes the swipe once the ScrollView is at its edge',
  options,
  async ({ app, screen }) => {
    await openExample(
      app,
      screen,
      'Issue #1156 Nested Horizontal Scroll Repro'
    );
    await screen.getByTestId('issue-1156-scroll-to-end').tap();
    await expectStatus(screen, 0, true);

    await screen.getByTestId('issue-1156-chips').swipe({ direction: 'right' });
    await expectStatus(screen, 1, true);
  }
);

test(
  'a swipe outside the ScrollView changes the page',
  options,
  async ({ app, screen }) => {
    await openExample(
      app,
      screen,
      'Issue #1156 Nested Horizontal Scroll Repro'
    );

    await screen.getByTestId('issue-1156-page-0').swipe({ direction: 'right' });
    await expectStatus(screen, 1, false);
  }
);
