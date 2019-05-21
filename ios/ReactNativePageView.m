
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
                                 [NSNumber numberWithLong:_pageMargin], UIPageViewControllerOptionInterPageSpacingKey,nil];
        
        ReactPageViewController *reactPageViewController = [[ReactPageViewController alloc] initWithTransitionStyle: _transitionStyle navigationOrientation: _orientation options:options];
        [self addSubview:reactPageViewController.view];
        reactPageViewController.view.frame = [self bounds];
        _reactPageViewController = reactPageViewController;
        _reactPageViewController.delegate = self;
        _reactPageViewController.dataSource = self;
        [self renderChildrenViewControllers];
    } else {
        RCTLog(@"getParentViewController returns nil");
    }
}

- (void) shouldScroll:(BOOL) scrollEnabled {
    _scrollEnabled = scrollEnabled;
    if(_reactPageViewController.view){
        _reactPageViewController.view.userInteractionEnabled = scrollEnabled;
    }
}

- (void)renderChildrenViewControllers{
        int index = 0;
        [_childrenViewControllers removeAllObjects];
        for (UIView* view in [self reactSubviews]) {
            [view removeFromSuperview];
            UIViewController *pageViewController = [self viewController:view];
            if(index == self.initialPage) {
                [self setReactViewControllers:index with:pageViewController direction: UIPageViewControllerNavigationDirectionForward animated:YES];
            }
            [_childrenViewControllers addObject: pageViewController];
            index++;
        }
}

-(void) setReactViewControllers:(NSInteger) index with:(UIViewController *) pageViewController direction:(UIPageViewControllerNavigationDirection) direction animated:(BOOL) animated{
    _currentIndex = index;
    [_reactPageViewController setViewControllers:[NSArray arrayWithObjects: pageViewController, nil] direction:direction animated:animated completion:nil];
}

- (UIViewController *)viewController:(UIView*)view {
    UIViewController *childViewController = [[UIViewController alloc] init];
    childViewController.view = view;
    return childViewController;
    
}

- (void) goTo:(NSNumber*) index animated:(BOOL) animated {
    if (_currentIndex >= 0 && index.integerValue < _childrenViewControllers.count) {
        UIPageViewControllerNavigationDirection direction =
        (index.integerValue > _currentIndex) ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
        UIViewController* viewController = [_childrenViewControllers objectAtIndex:index.integerValue];
        dispatch_async(dispatch_get_main_queue(), ^{
            [self setReactViewControllers:index.integerValue with:viewController direction:direction animated:animated];
        });
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

#pragma mark - Delegate

- (void)pageViewController:(UIPageViewController *)pageViewController willTransitionToViewControllers:(NSArray<UIViewController *> *)pendingViewControllers {
    if (pendingViewControllers.count == 1){
        NSMutableArray<UIViewController *> *childrenViewControllers = _childrenViewControllers;
        NSUInteger index = [childrenViewControllers indexOfObject: [pendingViewControllers objectAtIndex:0]];
        if (_onPageSelected) {
            _onPageSelected(@{@"position": [NSNumber numberWithLong:index]});
        }
    } else{
        RCTLog(@"Only one screen support");
    }
}

#pragma mark - Datasource After

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerAfterViewController:(UIViewController *)viewController {
    NSUInteger index = [_childrenViewControllers indexOfObject:viewController];
    
    if (index == NSNotFound) {
        return nil;
    }
    
    index++;
    
    if (index == [_childrenViewControllers count]) {
        return nil;
    }
    return [_childrenViewControllers objectAtIndex:index];
    
}

#pragma mark - Datasource Before

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerBeforeViewController:(UIViewController *)viewController {
    NSUInteger index = [_childrenViewControllers indexOfObject:viewController];
    
    if (index == NSNotFound) {
        return nil;
    }
    
    if (index == 0) {
        return nil;
    }
    
    index--;
    return [_childrenViewControllers objectAtIndex:index];
    
}

- (NSInteger)presentationCountForPageViewController:(UIPageViewController *)pageViewController {
    return [_childrenViewControllers count];
}

- (NSInteger)presentationIndexForPageViewController:(UIPageViewController *)pageViewController {
    return _currentIndex;
}


@end
