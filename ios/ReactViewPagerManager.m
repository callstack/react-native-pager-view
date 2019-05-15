
#import "ReactViewPagerManager.h"

@interface ReactViewPagerManager ()

@end

@implementation ReactViewPagerManager

RCT_EXPORT_MODULE(RNCViewPager)

- (UIView *)view {
    ReactNativePageView *reactNativePageView = [[ReactNativePageView alloc] init];
    reactNativePageView.dataSource = self;
    return reactNativePageView;
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerAfterViewController:(UIViewController *)viewController {
    NSUInteger index = viewController.view.tag - 9999;
    
    index++;
    
    if (index == 5) {
        return nil;
    }
    
    return [self viewControllerAtIndex:index];
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerBeforeViewController:(UIViewController *)viewController {
    NSUInteger index = viewController.view.tag - 9999;
    
    if (index == 0) {
        return nil;
    }
    
    index--;
    
    return [self viewControllerAtIndex:index];
    
}

- (NSInteger)presentationCountForPageViewController:(UIPageViewController *)pageViewController {
    return 5;
}

- (NSInteger)presentationIndexForPageViewController:(UIPageViewController *)pageViewController {
    return 0;
}

- (UIViewController *)viewControllerAtIndex:(NSUInteger)index {
    UIViewController *childViewController = [[UIViewController alloc] init];
    childViewController.view.tag = 9999 + index;
    NSArray<NSNumber *> *redColors = [NSMutableArray arrayWithObjects: @0.06, @0.19, @0.47, @0.71, @0.99, nil];
    NSNumber *red = [redColors objectAtIndex:index];
    childViewController.view.backgroundColor = [UIColor colorWithRed: red.floatValue green:0.5 blue:0.5 alpha:1];
    return childViewController;
    
}

@end
