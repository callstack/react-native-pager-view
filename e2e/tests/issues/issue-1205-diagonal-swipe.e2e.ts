import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: the Compose pager measured only its own axis and took drags
// that were mostly vertical.
const options = { tags: ['regression', 'issue-1205'], platforms: ['android'] };

async function openRepro(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Issue #1205 Diagonal Swipe Repro');
  await expect(screen.getByTestId('issue-1205-status')).toHaveText(
    'Selected: 0 | Scroll Y: 0'
  );
}

/** Drags up the list, `slant` px sideways (towards the next page) per px up. */
async function dragUpSlanted(screen: Screen, slant: number): Promise<void> {
  const box = await screen.getByTestId('issue-1205-list').boundingBox();
  if (!box) throw new Error('issue-1205-list has no bounds');
  const from = { x: box.x + box.width * 0.75, y: box.y + box.height * 0.8 };
  const up = Math.min(box.height * 0.4, (box.width * 0.6) / slant);
  await screen.swipe({
    from,
    to: { x: from.x - up * slant, y: from.y - up },
    duration: 400,
  });
}

test(
  'a slanted, mostly vertical drag scrolls the list',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    // Before the fix the pager took this drag and the list never moved.
    await dragUpSlanted(screen, 0.66);
    await expect(screen.getByTestId('issue-1205-status')).toHaveText(
      /^Selected: 0 \| Scroll Y: [1-9]/
    );
    await expect(screen.getByTestId('issue-1205-states')).toHaveText(
      'Pager states: -'
    );
  }
);

test(
  'a slanted, mostly horizontal drag changes the page',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await dragUpSlanted(screen, 1.6);
    await expect(screen.getByTestId('issue-1205-status')).toHaveText(
      'Selected: 1 | Scroll Y: 0'
    );
  }
);
