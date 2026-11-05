import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android only: Compose's interop filter cancelled the touch of an input on a page
// that had nothing to scroll, so a tap that moved at all left the cursor where it
// was. The input above the pager shows the same gesture outside the pager.
const options = { tags: ['regression', 'issue-1229'], platforms: ['android'] };

const STATUS = 'issue-1229-status';

const INPUTS = {
  outside: 'the input above the pager',
  single: 'a single-line input on a page',
  multi: 'a multiline input on a page',
};

async function openRepro(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Issue #1229 TextInput Cursor Repro');
  await expect(screen.getByTestId(STATUS)).toHaveText(
    'outside: -1 | single: -1 | multi: -1'
  );
}

/**
 * Presses `dx` px from the input's left edge and drags the finger a few px before
 * lifting, which is the tap that used to lose the input's touch. Staying inside
 * the pager's slop keeps the pager from treating it as a swipe.
 */
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

for (const [name, label] of Object.entries(INPUTS)) {
  test(
    `a tap that moves places the cursor in ${label}`,
    options,
    async ({ app, screen }) => {
      await openRepro(app, screen);
      // A plain tap first focuses the input, past the end of its text.
      await screen.getByTestId(`issue-1229-input-${name}`).tap();
      await expect(screen.getByTestId(STATUS)).toHaveText(
        new RegExp(`${name}: 10\\b`)
      );
      // Tapping the first letter with a moving finger must place the cursor there.
      await tapWithMove(screen, name, 14);
      await expect(screen.getByTestId(STATUS)).toHaveText(
        new RegExp(`${name}: [01]\\b`)
      );
    }
  );
}

test(
  'a tap that moves places the cursor with the pager locked',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await screen.getByTestId('issue-1229-scroll-enabled').tap();
    // Android's Button uppercases its label, so the check ignores the case.
    await expect(screen.getByTestId('issue-1229-scroll-enabled')).toHaveText(
      /scrollEnabled: false/i
    );

    // The reporter hit this with the pager locked too: the input still asks to
    // be intercepted again on its first move, whatever the pager allows.
    await screen.getByTestId('issue-1229-input-single').tap();
    await expect(screen.getByTestId(STATUS)).toHaveText(/single: 10\b/);
    await tapWithMove(screen, 'single', 14);
    await expect(screen.getByTestId(STATUS)).toHaveText(/single: [01]\b/);
  }
);

test(
  'a swipe still pages over after an input was tapped',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);

    // Tapping the input leaves it asking to be intercepted again, which the pager holds for the
    // event it is dispatching. The release must still reach the pager, so the next swipe moves it.
    await screen.getByTestId('issue-1229-input-single').tap();
    await expect(screen.getByTestId(STATUS)).toHaveText(/single: 10\b/);
    await screen
      .getByTestId('issue-1229-label-0')
      .swipe({ direction: 'right', momentum: 'fast' });
    await expect(screen.getByTestId('issue-1229-label-1')).toBeVisible();
    await expect(screen.getByTestId('issue-1229-label-0')).not.toBeVisible();
  }
);
