import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Device, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: the Compose pager reported onPageSelected once the page had
// settled, not as it started moving there as ViewPager2 did.
const options = { tags: ['regression', 'issue-1250'], platforms: ['android'] };

/** Opens the repro and waits for its status line. */
async function openRepro(
  device: Device,
  app: App,
  screen: Screen
): Promise<void> {
  await openExample(
    device,
    app,
    screen,
    'Issue #1250 Page Selected Timing Repro'
  );
  await expect(screen.getByTestId('issue-1250-status')).toHaveText(
    'No scroll yet'
  );
}

test(
  'setPage reports the selected page before it starts moving',
  options,
  async ({ device, app, screen }) => {
    await openRepro(device, app, screen);
    await screen.getByTestId('issue-1250-next').tap();
    await expect(screen.getByTestId('issue-1250-status')).toHaveText(
      'settling > selected 2 > idle | moved after selected: yes'
    );
  }
);

test(
  'a flick reports the selected page when the finger lifts',
  options,
  async ({ device, app, screen }) => {
    await openRepro(device, app, screen);
    // Released short of halfway, so only the fling takes the pager to the
    // next page. Before the fix this ended "moved after selected: no": the
    // page was reported only once it had stopped. A swipe past halfway was
    // reported early, in the frame between the drag and the fling.
    const box = await screen.getByTestId('issue-1250-page-0').boundingBox();
    if (!box) throw new Error('issue-1250-page-0 has no bounds');
    const y = box.y + box.height / 2;
    await screen.swipe({
      from: { x: box.x + box.width * 0.7, y },
      to: { x: box.x + box.width * 0.4, y },
      duration: 100,
    });
    await expect(screen.getByTestId('issue-1250-status')).toHaveText(
      'dragging > settling > selected 1 > idle | moved after selected: yes'
    );
  }
);
