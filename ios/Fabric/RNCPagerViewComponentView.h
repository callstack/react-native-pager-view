#ifdef RCT_NEW_ARCH_ENABLED

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import <React/RCTViewComponentView.h>
#import "UIViewController+CreateExtension.h"

NS_ASSUME_NONNULL_BEGIN

@interface RNCPagerViewComponentView : RCTViewComponentView <UIScrollViewDelegate>

- (void)setPage:(NSInteger)number;
- (void)setPageWithoutAnimation:(NSInteger)number;

@end

NS_ASSUME_NONNULL_END

#endif
