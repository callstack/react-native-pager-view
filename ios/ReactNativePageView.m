
#import "ReactNativePageView.h"
#import "React/RCTLog.h"

@implementation ReactNativePageView
- (instancetype)init {
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
    if (_reactPageViewController) {
        _reactPageViewController.view.userInteractionEnabled = _scrollEnabled;
        
        //Below line fix bug, where the view does not update after orientation changed.
        [self goTo:[NSNumber numberWithInteger:_currentIndex] animated:NO];
    } else {
        [self embed];
    }
}

- (void)didUpdateReactSubviews {
    [self shouldAddNewPage];
}

-(void)shouldAddNewPage {
    if (self.reactSubviews.count != _childrenViewControllers.count && _childrenViewControllers.count > 0) {
        [self addPage];
    }
}

- (void)addPage {
    if ([self reactViewController]) {
        UIViewController *pageViewController = [self createChildViewController:self.reactSubviews.lastObject];
        [_childrenViewControllers addObject:pageViewController];
        _reactPageIndicatorView.numberOfPages = _childrenViewControllers.count;
    } else {
        RCTLog(@"getParentViewController returns nil");
    }
}

- (void)embed {
    if ([self reactViewController]) {
        NSDictionary *options = [NSMutableDictionary
                                 dictionaryWithObjectsAndKeys:
                                 [NSNumber numberWithLong:_pageMargin],
                                 UIPageViewControllerOptionInterPageSpacingKey, nil];
        
        ReactPageViewController *reactPageViewController =
        [[ReactPageViewController alloc]
         initWithTransitionStyle:_transitionStyle
         navigationOrientation:_orientation
         options:options];
        
        _reactPageViewController = reactPageViewController;
        _reactPageViewController.delegate = self;
        _reactPageViewController.dataSource = self;
        [self renderChildrenViewControllers];
        _reactPageIndicatorView = [self createPageIndicator:self];
        _reactPageIndicatorView.hidden = !_showPageIndicator;
        
        [[self reactViewController] addChildViewController:_reactPageViewController];
        
        [reactPageViewController.view addSubview:_reactPageIndicatorView];
        [self addSubview:reactPageViewController.view];
        _reactPageViewController.view.frame = [self bounds];
        
        [_reactPageViewController didMoveToParentViewController:[self reactViewController]];
        
        // Add the page view controller's gesture recognizers to the view controller's view so that the gestures are started more easily.
        self.gestureRecognizers = _reactPageViewController.gestureRecognizers;
    } else {
        RCTLog(@"getParentViewController returns nil");
    }
}

- (void)shouldScroll:(BOOL)scrollEnabled {
    _scrollEnabled = scrollEnabled;
    if (_reactPageViewController.view) {
        _reactPageViewController.view.userInteractionEnabled = scrollEnabled;
    }
}

- (void)renderChildrenViewControllers {
    int index = 0;
    for (UIViewController *vc in _childrenViewControllers) {
        [vc.view removeFromSuperview];
    }
    [_childrenViewControllers removeAllObjects];
    
    for (UIView *view in [self reactSubviews]) {
        [view removeFromSuperview];
        UIViewController *pageViewController = [self createChildViewController:view];
        if (index == _initialPage) {
            [self
             setReactViewControllers:index
             with:pageViewController
             direction:UIPageViewControllerNavigationDirectionForward
             animated:YES];
        }
        [_childrenViewControllers addObject:pageViewController];
        index++;
    }
}

- (void)setReactViewControllers:(NSInteger)index
                           with:(UIViewController *)pageViewController
                      direction:(UIPageViewControllerNavigationDirection)direction
                       animated:(BOOL)animated {
    _currentIndex = index;
    [_reactPageViewController
     setViewControllers:[NSArray arrayWithObjects:pageViewController, nil]
     direction:direction
     animated:animated
     completion:nil];
}

- (UIViewController *)createChildViewController:(UIView *)view {
    UIViewController *childViewController = [[UIViewController alloc] init];
    childViewController.view = view;
    return childViewController;
}

- (void)goTo:(NSNumber *)index animated:(BOOL)animated {
    if (_currentIndex >= 0 &&
        index.integerValue < _childrenViewControllers.count) {
        
        _reactPageIndicatorView.currentPage = index.integerValue;
        UIPageViewControllerNavigationDirection direction =
        (index.integerValue > _currentIndex)
        ? UIPageViewControllerNavigationDirectionForward
        : UIPageViewControllerNavigationDirectionReverse;
        
        UIViewController *viewController =
        [_childrenViewControllers objectAtIndex:index.integerValue];
        [self setReactViewControllers:index.integerValue
                                     with:viewController
                                direction:direction
                                 animated:animated];

    }
}

#pragma mark - Delegate

- (void)pageViewController:(UIPageViewController *)pageViewController
willTransitionToViewControllers:
(NSArray<UIViewController *> *)pendingViewControllers {
    if (pendingViewControllers.count == 1) {
        NSMutableArray<UIViewController *> *childrenViewControllers =
        _childrenViewControllers;
        NSUInteger index = [childrenViewControllers
                            indexOfObject:[pendingViewControllers objectAtIndex:0]];
        _currentIndex = index;
        if (_onPageSelected) {
            _onPageSelected(@{@"position" : [NSNumber numberWithLong:index]});
        }
        _reactPageIndicatorView.currentPage = index;
    } else {
        RCTLog(@"Only one screen support");
    }
}

#pragma mark - Datasource After

- (UIViewController *)pageViewController:
(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
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

- (UIViewController *)pageViewController:
(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
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

#pragma mark - UIPageControl

- (void)shouldShowPageIndicator:(BOOL)showPageIndicator {
    _showPageIndicator = showPageIndicator;
    if (_reactPageIndicatorView){
        _reactPageIndicatorView.hidden = !showPageIndicator;
    }
}

- (UIPageControl *)createPageIndicator:(UIView *)parentView {
    CGPoint parentOrigin = parentView.frame.origin;
    CGSize parentSize = parentView.frame.size;
    UIPageControl *pageControl = [[UIPageControl alloc]
                                  initWithFrame:(CGRectMake(parentOrigin.x,
                                                            parentSize.height - 70,
                                                            parentSize.width,
                                                            70))];
    pageControl.numberOfPages = _childrenViewControllers.count;
    pageControl.currentPage = _initialPage;
    pageControl.tintColor = UIColor.blackColor;
    pageControl.pageIndicatorTintColor = UIColor.whiteColor;
    pageControl.currentPageIndicatorTintColor = UIColor.blackColor;
    return pageControl;
}

@end
