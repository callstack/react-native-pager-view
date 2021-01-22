#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNCViewPager, ViewPagerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(count, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(offset, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(onPageSelected, RCTBubblingEventBlock)

@end
