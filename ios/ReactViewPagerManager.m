
#import "ReactViewPagerManager.h"

@implementation ReactViewPagerManager

#pragma mark - RTC

RCT_EXPORT_MODULE(RNCViewPager)

RCT_EXPORT_VIEW_PROPERTY(count, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(offset, NSInteger)

RCT_EXPORT_VIEW_PROPERTY(onPageSelected, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPageScroll, RCTDirectEventBlock)

- (UIView *)view {
    return [[ReactNativePageView alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

@end
