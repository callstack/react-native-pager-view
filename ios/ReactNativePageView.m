
#import "ReactNativePageView.h"
#import "React/RCTLog.h"

@implementation ReactNativePageView
- (instancetype)init
{
    self = [super init];
    if (self) {
        _childrenViewControllers = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    if(_reactPageViewController){
        _reactPageViewController.view.frame = [self bounds];
    } else {
        [self embed];
    }
}

- (void)embed {
    if([self getParentViewController]){
        ReactPageViewController *reactPageViewController = [[ReactPageViewController alloc] initWithTransitionStyle: UIPageViewControllerTransitionStyleScroll navigationOrientation: UIPageViewControllerNavigationOrientationHorizontal options:nil];
        UIViewController *parentViewController = [self getParentViewController];
        [parentViewController addChildViewController:reactPageViewController];
        [self addSubview:reactPageViewController.view];
        reactPageViewController.view.frame = [self bounds];
        [reactPageViewController didMoveToParentViewController:parentViewController];
        _reactPageViewController = reactPageViewController;
        _reactPageViewController.delegate = _delegate;
        _reactPageViewController.dataSource = _dataSource;
        [self renderChildrenViewControllers];
    } else {
        RCTLog(@"getParentViewController returns nil");
    }
}

- (void)renderChildrenViewControllers{
        int index = 0;
        [_childrenViewControllers removeAllObjects];
        for (UIView* view in [self reactSubviews]) {
            [view removeFromSuperview];
            UIViewController *pageViewController = [self viewController:view];
            if(index == 0) {
                [_reactPageViewController setViewControllers:[NSArray arrayWithObjects: pageViewController, nil] direction:UIPageViewControllerNavigationDirectionForward animated:NO completion:nil];

            }
            [_childrenViewControllers addObject: pageViewController];
            index++;
        }
}

- (UIViewController *)viewController:(UIView*)view {
    UIViewController *childViewController = [[UIViewController alloc] init];
    childViewController.view = view;
    return childViewController;
    
}


- (UIViewController *) getParentViewController {
    UIResponder *parentResponder = self;
    while (parentResponder != nil) {
        parentResponder = parentResponder.nextResponder;
        if ([parentResponder isKindOfClass:UIViewController.class]){
            return (UIViewController * ) parentResponder;
        }
    }
    return nil;
}

@end
