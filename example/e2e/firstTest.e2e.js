const examples = [
  'Basic Example',
  'Keyboard Example',
  'OnPageScroll Example',
  'OnPageSelected Example',
  'Headphones Carousel Example',
  'Pagination Dots Example',
  'Scrollable PagerView Example',
  'ScrollView inside PagerView Example',
];

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have all examples titles', async () => {
    await Promise.all(
      examples.map(async (example) => {
        await expect(element(by.text(example))).toBeVisible();
      })
    );
  });

  // it('should show hello screen after tap', async () => {
  //   await element(by.id('hello_button')).tap();
  //   await expect(element(by.text('Hello!!!'))).toBeVisible();
  // });

  // it('should show world screen after tap', async () => {
  //   await element(by.id('world_button')).tap();
  //   await expect(element(by.text('World!!!'))).toBeVisible();
  // });
});
