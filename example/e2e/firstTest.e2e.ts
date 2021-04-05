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
  });
});
