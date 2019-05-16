
#import "ReactNativePageView.h"
#import "React/RCTLog.h"

@implementation ReactNativePageView
- (instancetype)init
{
    self = [super init];
    if (self) {
        _childrenViewControllers = [[NSMutableArray alloc] init];
        _scrollEnabled = YES;
        _pageMargin = 0;
        _transitionStyle = UIPageViewControllerTransitionStyleScroll;
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    _reactPageViewController.view.userInteractionEnabled = _scrollEnabled;
    if(_reactPageViewController){
        _reactPageViewController.view.frame = [self bounds];
    } else {
        [self embed];
    }
}

- (void)embed {
    if([self getParentViewController]){
        NSDictionary *options = [NSMutableDictionary dictionaryWithObjectsAndKeys: [NSNumber numberWithInt:_pageMargin], UIPageViewControllerOptionInterPageSpacingKey, nil];
        ReactPageViewController *reactPageViewController = [[ReactPageViewController alloc] initWithTransitionStyle: _transitionStyle navigationOrientation: UIPageViewControllerNavigationOrientationHorizontal options:options];
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
            if(index == self.initialPage) {
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
