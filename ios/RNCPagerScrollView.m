
#import "RNCPagerScrollView.h"

@implementation RNCPagerScrollView
- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        self.panGestureRecognizer.delegate = self;
    }
    return self;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer {
    if (gestureRecognizer == self.panGestureRecognizer) {
        CGPoint velocity = [self.panGestureRecognizer velocityInView:self];
        UIUserInterfaceLayoutDirection layoutDirection = [UIView userInterfaceLayoutDirectionForSemanticContentAttribute:self.semanticContentAttribute];
        BOOL isLTR = UIUserInterfaceLayoutDirectionLeftToRight == layoutDirection;
        BOOL isBackGesture = (isLTR && velocity.x > 0) || (!isLTR && velocity.x < 0);
        if (isBackGesture && self.contentOffset.x <= 0) {
            return YES;
        }
    }
    return NO;
}

@end
