import { freshAppBeforeEach, expect, test } from './support/test.ts';
import type { App, Device, Screen } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

// iOS-only: the prop is a no-op on Android.
const options = { tags: ['yield-to-nested-gestures'], platforms: ['ios'] };

const EXAMPLE = 'example-yield-to-nested-gestures';

async function openWithYield(
  device: Device,
  app: App,
  screen: Screen,
  yieldToNestedGestures: boolean
): Promise<void> {
  await openExample(device, app, screen, EXAMPLE);
  await expectStatus(screen, false, 0, 'none');
  if (yieldToNestedGestures) {
    await screen.getByTestId('yield-nested-toggle').tap();
    await expectStatus(screen, true, 0, 'none');
  }
}

type DragOptions = { duration?: number; atY?: number };

/**
 * Drags towards the next page, starting near the right of `testId` and ending
 * near the left of the pager: far enough for the pager to settle on the next
 * page when it takes the drag. `atY` places the start within `testId`'s
 * height, from 0 (top) to 1 (bottom).
 */
async function dragTowardsNextPage(
  screen: Screen,
  testId: string,
  { duration = 300, atY = 0.5 }: DragOptions = {}
): Promise<void> {
  const start = await screen.getByTestId(testId).boundingBox();
  const pager = await screen.getByTestId('yield-nested-pager').boundingBox();
  if (!start || !pager) throw new Error(`${testId} has no bounds`);
  const y = start.y + start.height * atY;
  await screen.swipe({
    from: { x: start.x + start.width - 24, y },
    to: { x: pager.x + pager.width * 0.02, y },
    duration,
  });
}

function statusText(
  yieldToNestedGestures: boolean,
  page: number,
  moved: string
): string {
  return `Yield: ${
    yieldToNestedGestures ? 'on' : 'off'
  } | Page: ${page} | Moved: ${moved}`;
}

async function expectStatus(
  screen: Screen,
  yieldToNestedGestures: boolean,
  page: number,
  moved: string
): Promise<void> {
  await expect(screen.getByTestId('yield-nested-status')).toHaveText(
    statusText(yieldToNestedGestures, page, moved)
  );
}

/**
 * Drags as `dragTowardsNextPage` does and expects the status it should leave.
 * A busy simulator occasionally drops a synthesized drag before it reaches the
 * app, which leaves the status unchanged, so a drag that changed nothing is
 * sent once more. A wrong outcome fails both times.
 */
async function dragAndExpect(
  screen: Screen,
  testId: string,
  drag: DragOptions,
  [yieldToNestedGestures, page, moved]: [boolean, number, string]
): Promise<void> {
  const status = screen.getByTestId('yield-nested-status');
  await dragTowardsNextPage(screen, testId, drag);
  try {
    await expect(status).toHaveText(
      statusText(yieldToNestedGestures, page, moved),
      { timeout: 5_000 }
    );
  } catch (error) {
    if (
      (await status.textContent()) !==
      statusText(yieldToNestedGestures, 0, 'none')
    ) {
      throw error;
    }
    await dragTowardsNextPage(screen, testId, drag);
    await expectStatus(screen, yieldToNestedGestures, page, moved);
  }
}

test(
  'with the prop, dragging a row moves the row and keeps the page',
  options,
  async ({ device, app, screen }) => {
    await openWithYield(device, app, screen, true);

    await dragAndExpect(screen, 'yield-nested-row-0-0', {}, [true, 0, '0-0']);
  }
);

test(
  'with the prop, dragging beside the rows changes the page',
  options,
  async ({ device, app, screen }) => {
    await openWithYield(device, app, screen, true);

    await dragAndExpect(screen, 'yield-nested-gutter-0', {}, [true, 1, 'none']);
  }
);

test(
  'with the prop, a fast drag on a row moves the row and keeps the page',
  options,
  async ({ device, app, screen }) => {
    await openWithYield(device, app, screen, true);

    await dragAndExpect(screen, 'yield-nested-row-0-0', { duration: 100 }, [
      true,
      0,
      '0-0',
    ]);
  }
);

test(
  'with the prop, dragging the list below the rows changes the page',
  options,
  async ({ device, app, screen }) => {
    await openWithYield(device, app, screen, true);

    await dragAndExpect(screen, 'yield-nested-list-0', { atY: 0.8 }, [
      true,
      1,
      'none',
    ]);
  }
);

test(
  'without the prop, dragging a row changes the page',
  options,
  async ({ device, app, screen }) => {
    await openWithYield(device, app, screen, false);

    await dragAndExpect(screen, 'yield-nested-row-0-0', {}, [false, 1, 'none']);
  }
);
