
#import "ReactViewPagerManager.h"

@implementation ReactViewPagerManager

#pragma mark - RTC

RCT_EXPORT_MODULE(RNCViewPager)

RCT_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(pageMargin, NSInteger)

RCT_EXPORT_VIEW_PROPERTY(transitionStyle, UIPageViewControllerTransitionStyle)
RCT_EXPORT_VIEW_PROPERTY(orientation, UIPageViewControllerNavigationOrientation)
RCT_EXPORT_VIEW_PROPERTY(onPageSelected, RCTBubblingEventBlock)


RCT_EXPORT_METHOD(goToPage:(nonnull NSNumber*) reactTag index:(nonnull NSNumber*) index animated:(BOOL) animated) {
    [(ReactNativePageView*)[self view] goToPage:index animated:animated];
}

RCT_CUSTOM_VIEW_PROPERTY(scrollEnabled, BOOL, ReactNativePageView){
    [view shouldScroll:[RCTConvert BOOL:json]];
}

- (UIView *)view {
    ReactNativePageView* reactNativePageView = [[ReactNativePageView alloc] init];
    return reactNativePageView;
}

@end
