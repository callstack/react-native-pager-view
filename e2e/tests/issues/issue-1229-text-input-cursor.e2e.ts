import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: Compose cancelled the touch of a TextInput on a page that had
// nothing to scroll, so a tap that moved at all left the cursor where it was.
const options = { tags: ['regression', 'issue-1229'], platforms: ['android'] };

const STATUS = 'issue-1229-status';

async function openRepro(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Issue #1229 TextInput Cursor Repro');
  await expect(screen.getByTestId(STATUS)).toHaveText(
    'outside: -1 | single: -1 | multi: -1'
  );
}

/** Taps the input `dx` px from its left edge, moving the finger a few px. */
async function tapWithMove(
  screen: Screen,
  name: string,
  dx: number
): Promise<void> {
  const box = await screen
    .getByTestId(`issue-1229-input-${name}`)
    .boundingBox();
  if (!box) throw new Error(`issue-1229-input-${name} has no bounds`);
  const from = { x: box.x + dx, y: box.y + Math.min(box.height / 2, 24) };
  await screen.swipe({
    from,
    to: { x: from.x + 3, y: from.y + 1 },
    duration: 150,
  });
}

// The input above the pager checks the gesture itself, apart from the pager.
const INPUTS = {
  outside: 'the input above the pager',
  single: 'a single-line input on a page',
  multi: 'a multiline input on a page',
};

for (const [name, label] of Object.entries(INPUTS)) {
  test(
    `a tap that moves places the cursor in ${label}`,
    options,
    async ({ app, screen }) => {
      await openRepro(app, screen);
      // Focuses the input past the end of its text, so the cursor goes last.
      await screen.getByTestId(`issue-1229-input-${name}`).tap();
      await expect(screen.getByTestId(STATUS)).toHaveText(
        new RegExp(`${name}: 10\\b`)
      );
      await tapWithMove(screen, name, 14);
      await expect(screen.getByTestId(STATUS)).toHaveText(
        new RegExp(`${name}: [01]\\b`)
      );
    }
  );
}
