#import "RNCPagerViewShadowView.h"

@implementation RNCPagerViewShadowView {
  BOOL _transitioning;
}

- (void)layoutWithMetrics:(RCTLayoutMetrics)layoutMetrics
            layoutContext:(RCTLayoutContext)layoutContext {
    // Prevent layout updates during a transition, as they cause the `setViewControllers`
    // method to skip calling its completion block.
    if (_transitioning) {
      return;
    }
  
    [super layoutWithMetrics:layoutMetrics layoutContext:layoutContext];
}

- (void)setLocalData:(NSDictionary *)localData {
    [super setLocalData:localData];
  
    _transitioning = [localData[@"transitioning"] boolValue];
}

@end
