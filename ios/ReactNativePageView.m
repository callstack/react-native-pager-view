
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
        _orientation = UIPageViewControllerNavigationOrientationHorizontal;
        _currentIndex = 0;
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
        NSDictionary *options = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                 [NSNumber numberWithInt:_pageMargin], UIPageViewControllerOptionInterPageSpacingKey,nil];
        
        ReactPageViewController *reactPageViewController = [[ReactPageViewController alloc] initWithTransitionStyle: _transitionStyle navigationOrientation: _orientation options:options];
        [self addSubview:reactPageViewController.view];
        reactPageViewController.view.frame = [self bounds];
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
                [self setReactViewControllers:index with:pageViewController];
            }
            [_childrenViewControllers addObject: pageViewController];
            index++;
        }
}

-(void) setReactViewControllers:(NSInteger) index with:(UIViewController *) pageViewController {
    _currentIndex = index;
    [_reactPageViewController setViewControllers:[NSArray arrayWithObjects: pageViewController, nil] direction:UIPageViewControllerNavigationDirectionForward animated:NO completion:nil];
}

- (UIViewController *)viewController:(UIView*)view {
    UIViewController *childViewController = [[UIViewController alloc] init];
    childViewController.view = view;
    return childViewController;
    
}

-(void) goToNextPage {
    if(!_reactPageViewController) { return; }
    if(![_reactPageViewController.viewControllers objectAtIndex:0]) { return; }
    
    UIViewController *currentViewController = [_reactPageViewController.viewControllers objectAtIndex:0];
    UIViewController *nextViewController = [_reactPageViewController.dataSource pageViewController:_reactPageViewController viewControllerAfterViewController:currentViewController];
    if(!nextViewController) { return; }
    dispatch_async(dispatch_get_main_queue(), ^{
        [self setReactViewControllers:_currentIndex+1 with:nextViewController];
    });

}

-(void) goToPreviousPage {
    if(!_reactPageViewController) { return; }
    if(![_reactPageViewController.viewControllers objectAtIndex:0]) { return; }
    
    UIViewController *currentViewController = [_reactPageViewController.viewControllers objectAtIndex:0];
    UIViewController *previousViewController = [_reactPageViewController.dataSource pageViewController:_reactPageViewController viewControllerBeforeViewController:currentViewController];
    if(!previousViewController) { return; }
    dispatch_async(dispatch_get_main_queue(), ^{
        [self setReactViewControllers:_currentIndex-1 with:previousViewController];
    });
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
