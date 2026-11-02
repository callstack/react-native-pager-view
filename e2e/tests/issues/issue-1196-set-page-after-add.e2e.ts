import { freshAppBeforeEach, expect, test } from '../support/test.ts';
import type { App, Screen } from '../support/test.ts';
import { openExample } from '../support/app.ts';

freshAppBeforeEach();

// Android-only: Fabric runs view commands before the mount items of the same
// batch there. iOS runs them in order and has no index check, so the test for
// an index that isn't there yet doesn't hold there.
const options = {
  tags: ['regression', 'issue-1196', 'issue-949'],
  platforms: ['android'],
};

/** Opens the repro and waits for the pager to report its only page. */
async function openRepro(app: App, screen: Screen): Promise<void> {
  await openExample(app, screen, 'Issue #1196 Set Page After Add Repro');
  await expect(screen.getByTestId('issue-1196-status')).toHaveText(
    'Pages: 1 | Selected: 0 | Events: 1'
  );
}

/** Taps a repro button and checks that page D got selected. */
async function expectDSelected(screen: Screen, button: string): Promise<void> {
  await screen.getByTestId(button).tap();
  // Before the fix the command was dropped and the pager stayed on page A.
  await expect(screen.getByTestId('issue-1196-status')).toHaveText(
    'Pages: 4 | Selected: 3 | Events: 2'
  );
  await expect(screen.getByText('Page D')).toBeVisible();
}

test(
  'setPageWithoutAnimation selects a page added in the same commit',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await expectDSelected(screen, 'issue-1196-add-select-d');
  }
);

test(
  'setPage animates to a page added in the same commit',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await expectDSelected(screen, 'issue-1196-add-animate-d');
  }
);

test(
  'setPage from useEffect animates to a page added in the same commit',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await expectDSelected(screen, 'issue-1196-add-select-d-effect');
  }
);

test(
  'setPageWithoutAnimation selects a page added to an empty pager in the same commit',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    await screen.getByTestId('issue-1196-remove-pages').tap();
    await expect(screen.getByTestId('issue-1196-status')).toHaveText(
      'Pages: 0 | Selected: 0 | Events: 1'
    );
    // The pager state is new here, so this also checks that D gets reported.
    await expectDSelected(screen, 'issue-1196-add-select-d');
  }
);

test(
  'an index that is not there yet is ignored, not applied later',
  options,
  async ({ app, screen }) => {
    await openRepro(app, screen);
    // An empty pager doesn't run its scroll command handling, so this is where
    // a command kept for later would wait for the pages.
    await screen.getByTestId('issue-1196-remove-pages').tap();
    await expect(screen.getByTestId('issue-1196-status')).toHaveText(
      'Pages: 0 | Selected: 0 | Events: 1'
    );
    await screen.getByTestId('issue-1196-select-d').tap();
    await screen.getByTestId('issue-1196-add').tap();
    await expect(screen.getByTestId('issue-1196-status')).toHaveText(
      /^Pages: 4 \| Selected: 0 \|/
    );
    // A command kept from before the pages arrived would move the pager to D.
    // The negated matcher has to hold for a second, so a late jump fails too.
    await expect(screen.getByText('Page A')).toBeVisible();
    await expect(screen.getByText('Page D')).not.toBeVisible();
  }
);

test(
  'pages that come back report the page the pager lands on once',
  options,
  async ({ app, screen }) => {
    const status = screen.getByTestId('issue-1196-status');
    const removeAndAddPages = async () => {
      await screen.getByTestId('issue-1196-remove-pages').tap();
      await expect(status).toHaveText(/^Pages: 0 \|/);
      await screen.getByTestId('issue-1196-add').tap();
    };
    await openRepro(app, screen);
    await screen.getByTestId('issue-1196-add').tap();
    await screen.getByTestId('issue-1196-select-d').tap();
    await expect(status).toHaveText('Pages: 4 | Selected: 3 | Events: 2');
    await removeAndAddPages();
    await expect(status).toHaveText('Pages: 4 | Selected: 0 | Events: 3');
    await removeAndAddPages();
    await expect(screen.getByText('Page A')).toBeVisible();
    await expect(status).not.toHaveText(/Events: 4/);
  }
);
