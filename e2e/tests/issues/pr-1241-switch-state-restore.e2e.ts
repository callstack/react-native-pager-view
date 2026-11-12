import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: the state was saved and restored by Compose's AndroidView,
// which hosts the pages there.
const options = { tags: ['regression', 'pr-1241'], platforms: ['android'] };

const STATUS = 'pr-1241-status';

test(
  'a page that comes back keeps the switch value React set while it was away',
  options,
  async ({ app, screen }) => {
    await openExample(app, screen, 'PR #1241 Switch State Restore Repro');
    await expect(screen.getByTestId(STATUS)).toHaveText(
      'value: off | changes: 0'
    );

    await screen.getByTestId('pr-1241-go-to-2').tap();
    await expect(screen.getByTestId('pr-1241-switch')).toBeVisible();

    // Two pages away, page 2 leaves the composition and its state is saved.
    await screen.getByTestId('pr-1241-go-to-0').tap();
    await expect(screen.getByTestId('pr-1241-page-0')).toBeVisible();

    await screen.getByTestId('pr-1241-turn-on').tap();
    await expect(screen.getByTestId(STATUS)).toHaveText(
      'value: on | changes: 0'
    );

    // Before the fix, the restored state set the switch back to off, which
    // emitted onValueChange(false). The negated matcher has to hold for a
    // second, so a late event fails too.
    await screen.getByTestId('pr-1241-go-to-2').tap();
    await expect(screen.getByTestId('pr-1241-switch')).toBeVisible();
    await expect(screen.getByTestId(STATUS)).toHaveText(
      'value: on | changes: 0'
    );
    await expect(screen.getByTestId(STATUS)).not.toHaveText(/changes: [1-9]/);
  }
);
