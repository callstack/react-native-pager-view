#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"

@interface PagerViewViewManager : RCTViewManager
@end

@implementation PagerViewViewManager

RCT_EXPORT_MODULE(PagerViewView)

- (UIView *)view
{
    return [[UIView alloc] init];
}

@end
