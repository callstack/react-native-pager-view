//
//  UIPageViewController+SafeSet.h
//
//  Ensures -setViewControllers:direction:animated:completion: always invokes
//  its completion block, even when UIKit silently drops it during rapid or
//  overlapping transitions.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface UIPageViewController (SafeSet)

/**
 A safe wrapper around -setViewControllers:direction:animated:completion: that
 guarantees the completion block is called exactly once.

 When the system completion block is not delivered within a 1-second timeout
 (a known UIPageViewController quirk during rapid/overlapping transitions),
 a fallback timer fires the completion block with `finished = NO`.
 Debounce logic ensures that only the *last* of several rapid calls retains
 an active timeout, preventing stale completions from interfering with each
 other.

 @param viewControllers View controllers to display.
 @param direction       Navigation direction.
 @param animated        Whether the transition is animated.
 @param completion      Block invoked exactly once when the transition ends
                        (or when the timeout expires).
 */
- (void)safeSetViewControllers:(nullable NSArray<UIViewController *> *)viewControllers
                     direction:(UIPageViewControllerNavigationDirection)direction
                      animated:(BOOL)animated
                    completion:(void (^ _Nullable)(BOOL finished))completion;

@end

NS_ASSUME_NONNULL_END
