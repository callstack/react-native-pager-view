
#import "ReactViewPagerManager.h"

@implementation ReactViewPagerManager

#pragma mark - RTC

RCT_EXPORT_MODULE(RNCViewPager)

RCT_EXPORT_VIEW_PROPERTY(count, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(offset, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(transitionStyle, UIPageViewControllerTransitionStyle)
RCT_EXPORT_VIEW_PROPERTY(orientation, UIPageViewControllerNavigationOrientation)
RCT_EXPORT_VIEW_PROPERTY(onPageSelected, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPageScroll, RCTDirectEventBlock)

RCT_EXPORT_METHOD(setPage:(nonnull NSNumber *)reactTag
                    index:(nonnull NSNumber *)index
                 animated:(BOOL)animated) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        ReactNativePageView *view = (ReactNativePageView *)viewRegistry[reactTag];
        if (!view || ![view isKindOfClass:[ReactNativePageView class]]) {
            RCTLogError(@"Cannot find ReactNativePageView with tag #%@", reactTag);
            return;
        }
        [view goTo:index.integerValue animated:animated];
    }];
}

- (UIView *)view {
    return [[ReactNativePageView alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

@end
