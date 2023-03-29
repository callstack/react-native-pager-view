
#import "RNCPagerScrollView.h"

@implementation RNCPagerScrollView
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
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
        // if it's back gesture and scroll view is at the beginning of scroll we allow simultaneous gesture
        if (isBackGesture && self.contentOffset.x <= 0) {
            return YES;
        }
    }
    return NO;
}

@end
