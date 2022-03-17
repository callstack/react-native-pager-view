#import <React/RCTViewManager.h>
#import "RNCPagerViewComponentView.h"
@interface RNCPagerViewManager : RCTViewManager
@end

@implementation RNCPagerViewManager

RCT_EXPORT_MODULE(RNCViewPager)
RCT_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(pageMargin, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(orientation, UIPageViewControllerNavigationOrientation)
RCT_EXPORT_VIEW_PROPERTY(onPageSelected, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPageScroll, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPageScrollStateChanged, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(overdrag, BOOL)
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(layoutDirection, NSString)

- (UIView *)view
{
  return [[RNCPagerViewComponentView alloc] init];
}

@end
