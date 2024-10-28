#import <UIKit/UIKit.h>

@protocol RtlLayoutProtocol <NSObject>

@property (nonatomic, readonly) BOOL isHorizontal;
@property (nonatomic, readonly) BOOL isLtrLayout;

@end

@interface UIView (RtlLayoutProtocol)

- (BOOL)isHorizontalRtlLayout;

@end
