//
//  UIPageViewController+SafeSet.m
//

#import "UIPageViewController+SafeSet.h"
#import <objc/runtime.h>

@implementation UIPageViewController (SafeSet)

static const void *kSafeSetTimerKey = &kSafeSetTimerKey;

- (void)safeSetViewControllers:(nullable NSArray<UIViewController *> *)viewControllers
                     direction:(UIPageViewControllerNavigationDirection)direction
                      animated:(BOOL)animated
                    completion:(void (^ _Nullable)(BOOL finished))completion {
    static const NSTimeInterval kSafeSetTimeout = 1.0;

    // Debounce: cancel the pending timeout from a previous rapid call so only
    // the latest call retains a fallback timer.
    dispatch_block_t previousTimer = objc_getAssociatedObject(self, kSafeSetTimerKey);
    if (previousTimer) {
        dispatch_block_cancel(previousTimer);
        objc_setAssociatedObject(self, kSafeSetTimerKey, nil, OBJC_ASSOCIATION_RETAIN);
    }

    // Guard: ensure the completion block is invoked at most once regardless of
    // whether the system callback or the timeout fires first.
    __block BOOL hasCompleted = NO;
    void (^executeCompletion)(BOOL) = ^(BOOL finished) {
        if (!hasCompleted) {
            hasCompleted = YES;
            if (completion) {
                completion(finished);
            }
        }
    };

    __weak typeof(self) weakSelf = self;
    dispatch_block_t timer = dispatch_block_create(0, ^{
        __strong typeof(self) strongSelf = weakSelf;
        if (!strongSelf) return;
        // System never called back — fire completion with finished = NO.
        objc_setAssociatedObject(strongSelf, kSafeSetTimerKey, nil, OBJC_ASSOCIATION_RETAIN);
        executeCompletion(NO);
    });

    objc_setAssociatedObject(self, kSafeSetTimerKey, timer, OBJC_ASSOCIATION_RETAIN);
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(kSafeSetTimeout * NSEC_PER_SEC)),
                   dispatch_get_main_queue(),
                   timer);

    [self setViewControllers:viewControllers
                   direction:direction
                    animated:animated
                  completion:^(BOOL finished) {
        dispatch_block_cancel(timer);
        executeCompletion(finished);
    }];
}

@end
