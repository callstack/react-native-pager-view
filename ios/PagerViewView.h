// This guard prevent this file to be compiled in the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

#ifndef PagerViewViewNativeComponent_h
#define PagerViewViewNativeComponent_h

NS_ASSUME_NONNULL_BEGIN

@interface PagerViewView : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END

#endif /* PagerViewViewNativeComponent_h */
#endif /* RCT_NEW_ARCH_ENABLED */
