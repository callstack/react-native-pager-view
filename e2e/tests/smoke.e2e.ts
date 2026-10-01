import { freshAppBeforeEach, expect, test } from './support/test.ts';
import { openExample } from './support/app.ts';

freshAppBeforeEach();

test(
  'horizontal pager pages with the panel buttons',
  { tags: ['smoke'] },
  async ({ app, screen }) => {
    await openExample(app, screen, 'example-basic-horizontal');
    await expect(screen.getByTestId('pager-view-horizontal')).toBeVisible();
    await expect(screen.getByTestId('pageNumber0')).toHaveText('page number 0');

    await screen.getByTestId('next-page-button').tap();
    await expect(screen.getByTestId('pageNumber1')).toHaveText('page number 1');

    await screen.getByTestId('prev-page-button').tap();
    await expect(screen.getByTestId('pageNumber0')).toHaveText('page number 0');
  }
);
