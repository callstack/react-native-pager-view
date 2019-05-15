
#import "ReactNativePageView.h"
#import "React/RCTLog.h"

@implementation ReactNativePageView

- (instancetype)initWithProtocols: (id <UIPageViewControllerDelegate>) delegate and:(id <UIPageViewControllerDataSource>) dataSource {
    self = [super init];
    if (self) {
        _delegate = delegate;
        _dataSource = dataSource;
    }
    return self;
}

- (void)layoutSubviews {
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
    } else {
        RCTLog(@"getParentViewController returns nil");
    }
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
