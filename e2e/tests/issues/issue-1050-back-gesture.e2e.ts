import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample, restoreLtrAfterEach } from '../support/app.ts';
import type { LayoutDirection } from '../support/app.ts';

freshAppBeforeEach();

// iOS-only: the fix arbitrates against the navigation controller's back
// gesture. A mid-screen back swipe is the full-screen content pop of iOS 26,
// which the native stack gets without fullScreenGestureEnabled.
const options = { tags: ['regression', 'issue-1050'], platforms: ['ios'] };

const EXAMPLE = 'Issue #1050 Back Gesture Repro';
const NESTED_EXAMPLE = 'Issue #1050 Nested Stack Back Gesture Repro';

async function openRepro(
  app: App,
  screen: Screen,
  example: string,
  direction: LayoutDirection = 'ltr'
): Promise<void> {
  await openExample(app, screen, example, direction);
  await expectPage(screen, 0);
}

/**
 * Drags across the middle of the pager, away from the screen edge so the edge
 * pop recognizer can't take it. `back` drags the way a back swipe goes in the
 * layout direction, otherwise towards the next page.
 */
async function dragAcrossPager(
  screen: Screen,
  direction: LayoutDirection,
  back: boolean
): Promise<void> {
  const box = await screen.getByTestId('issue-1050-pager').boundingBox();
  if (!box) throw new Error('issue-1050-pager has no bounds');
  const y = box.y + box.height / 2;
  const left = box.x + box.width * 0.3;
  const right = box.x + box.width * 0.9;
  const towardsRight = back === (direction === 'ltr');
  await screen.swipe({
    from: { x: towardsRight ? left : right, y },
    to: { x: towardsRight ? right : left, y },
    duration: 300,
  });
}

async function expectPage(screen: Screen, page: number): Promise<void> {
  await expect(screen.getByTestId('issue-1050-status')).toHaveText(
    `Selected: ${page}`
  );
}

/** The home list stays scrolled to the example's entry after the pop. */
async function expectPopped(screen: Screen, example: string): Promise<void> {
  await expect(screen.getByTestId(example)).toBeVisible();
  await expect(screen.getByTestId('issue-1050-pager')).toBeHidden();
}

function describeBackGesture(direction: LayoutDirection): void {
  test(
    'a back swipe on the first page pops the screen',
    options,
    async ({ app, screen }) => {
      await openRepro(app, screen, EXAMPLE, direction);

      // Before the fix the pager claimed the drag and the screen stayed.
      await dragAcrossPager(screen, direction, true);
      await expectPopped(screen, EXAMPLE);
    }
  );

  test(
    'a back swipe on a later page goes to the previous page',
    options,
    async ({ app, screen }) => {
      await openRepro(app, screen, EXAMPLE, direction);
      await dragAcrossPager(screen, direction, false);
      await expectPage(screen, 1);

      await dragAcrossPager(screen, direction, true);
      await expectPage(screen, 0);
    }
  );

  test(
    'a forward swipe on the first page still goes to the next page',
    options,
    async ({ app, screen }) => {
      await openRepro(app, screen, EXAMPLE, direction);

      await dragAcrossPager(screen, direction, false);
      await expectPage(screen, 1);
    }
  );
}

test.describe('back gesture over the pager', () => {
  test.describe('in LTR', () => {
    describeBackGesture('ltr');
  });

  test.describe('in RTL', () => {
    restoreLtrAfterEach();
    describeBackGesture('rtl');
  });
});

test.describe('back gesture over a pager in a nested stack', () => {
  test(
    'a back swipe on the first page pops the outer stack',
    options,
    async ({ app, screen }) => {
      await openRepro(app, screen, NESTED_EXAMPLE);

      // The inner stack has only its root screen. Before skipping stacks that
      // can't pop, the pager stopped there and kept the drag.
      await dragAcrossPager(screen, 'ltr', true);
      await expectPopped(screen, NESTED_EXAMPLE);
    }
  );

  test(
    'a forward swipe on the first page still goes to the next page',
    options,
    async ({ app, screen }) => {
      await openRepro(app, screen, NESTED_EXAMPLE);

      await dragAcrossPager(screen, 'ltr', false);
      await expectPage(screen, 1);
    }
  );
});
