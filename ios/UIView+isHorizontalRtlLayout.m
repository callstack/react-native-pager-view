#import "UIView+isHorizontalRtlLayout.h"


@implementation UIView (RtlLayoutProtocol)

- (BOOL)isHorizontalRtlLayout {
    if ([self conformsToProtocol:@protocol(RtlLayoutProtocol)]) {
        id<RtlLayoutProtocol> layoutObject = (id<RtlLayoutProtocol>)self;
        return layoutObject.isHorizontal && !layoutObject.isLtrLayout;
    }
    return NO;
}

@end
