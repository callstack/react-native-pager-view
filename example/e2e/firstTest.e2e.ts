import { by, device, expect, element } from 'detox';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('swipes to the next page', async () => {
    await element(by.text('Basic Example')).tap();
    await expect(element(by.id('pageNumber0'))).toBeVisible();
    await element(by.id('pager-view')).swipe('left', 'fast');
    await expect(element(by.id('pageNumber1'))).toBeVisible();
    await element(by.id('pager-view')).swipe('right', 'fast');
    await expect(element(by.id('pageNumber0'))).toBeVisible();
  });

  it('does not swipe to the next page, when scroll is disabled', async () => {
    await element(by.text('Basic Example')).tap();
    await element(by.text('Scroll Enabled')).tap();
    await expect(element(by.id('pageNumber0'))).toBeVisible();
    await element(by.id('pager-view')).swipe('left', 'fast');
    await expect(element(by.id('pageNumber1'))).toBeNotVisible();
    await expect(element(by.id('pageNumber0'))).toBeVisible();
  });

  it('adds a new page at the end', async () => {
    await element(by.text('Basic Example')).tap();
    await element(by.text('Add new page')).tap();
    await element(by.text('Last')).tap();
    await expect(element(by.id('pageNumber10'))).toBeVisible();
  });
  it('removes the last page', async () => {
    await element(by.text('Basic Example')).tap();
    await element(by.text('Remove last page')).tap();
    await element(by.text('Last')).tap();
    await expect(element(by.id('pageNumber8'))).toBeVisible();
  });

  it('goes to the desired page programmatically', async () => {
    await element(by.text('Basic Example')).tap();
    await expect(element(by.id('pageNumber0'))).toBeVisible();
    await element(by.text('Next')).tap();
    await expect(element(by.id('pageNumber1'))).toBeVisible();
    await element(by.text('Prev')).tap();
    await expect(element(by.id('pageNumber0'))).toBeVisible();
    await element(by.text('Last')).tap();
    await expect(element(by.id('pageNumber9'))).toBeVisible();
    await element(by.text('Start')).tap();
    await expect(element(by.id('pageNumber0'))).toBeVisible();
  });
});
