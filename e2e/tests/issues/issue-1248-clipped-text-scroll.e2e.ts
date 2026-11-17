import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: the Compose pager disabled the ScrollView's interception when
// a drag started over a clipped TextView with a scroll range.
const options = { tags: ['regression', 'issue-1248'], platforms: ['android'] };

test(
  'an upward drag over clipped text scrolls the list',
  options,
  async ({ device, app, screen }) => {
    await openExample(
      device,
      app,
      screen,
      'Issue #1248 Clipped Text Scroll Repro'
    );
    await expect(screen.getByTestId('issue-1248-status')).toHaveText(
      'Scroll Y: 0'
    );

    const box = await screen.getByTestId('issue-1248-preview').boundingBox();
    if (!box) throw new Error('issue-1248-preview has no bounds');
    const from = { x: box.x + box.width / 2, y: box.y + box.height * 0.8 };
    await screen.swipe({
      from,
      to: { x: from.x, y: from.y - 300 },
      duration: 400,
    });

    await expect(screen.getByTestId('issue-1248-status')).toHaveText(
      /^Scroll Y: [1-9]/
    );
  }
);
