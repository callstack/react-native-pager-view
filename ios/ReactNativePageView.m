
#import "ReactNativePageView.h"
#import "React/RCTLog.h"
#import <React/RCTViewManager.h>

#import "UIViewController+CreateExtension.h"
#import "RCTOnPageScrollEvent.h"
#import "RCTOnPageScrollStateChanged.h"
#import "RCTOnPageSelected.h"

@interface ReactNativePageView () <UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate>

@property(nonatomic, strong) UIPageViewController *reactPageViewController;
@property(nonatomic, strong) UIPageControl *reactPageIndicatorView;
@property(nonatomic, strong) RCTEventDispatcher *eventDispatcher;

@property(nonatomic, weak) UIScrollView *scrollView;
@property(nonatomic, weak) UIView *currentView;

@property(nonatomic, strong) NSHashTable<UIViewController *> *cachedControllers;

- (void)goTo:(NSInteger)index animated:(BOOL)animated;
- (void)shouldScroll:(BOOL)scrollEnabled;
- (void)shouldShowPageIndicator:(BOOL)showPageIndicator;
- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard;

@end

@implementation ReactNativePageView {
    uint16_t _coalescingKey;
}

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher {
    if (self = [super init]) {
        _scrollEnabled = YES;
        _pageMargin = 0;
        _transitionStyle = UIPageViewControllerTransitionStyleScroll;
        _orientation = UIPageViewControllerNavigationOrientationHorizontal;
        _currentIndex = 0;
        _dismissKeyboard = UIScrollViewKeyboardDismissModeNone;
        _coalescingKey = 0;
        _eventDispatcher = eventDispatcher;
        _cachedControllers = [NSHashTable weakObjectsHashTable];
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    if (self.reactPageViewController) {
        [self shouldScroll:self.scrollEnabled];
        //Below line fix bug, where the view does not update after orientation changed.
        [self updateDataSource];
    }
}

- (void)didUpdateReactSubviews {
    if (!self.reactPageViewController) {
        [self embed];
        [self setupInitialController];
    } else {
        [self updateDataSource];
    }
}

- (void)embed {
    NSDictionary *options = @{ UIPageViewControllerOptionInterPageSpacingKey: @(self.pageMargin) };
    UIPageViewController *pageViewController = [[UIPageViewController alloc] initWithTransitionStyle:self.transitionStyle
                                                                               navigationOrientation:self.orientation
                                                                                             options:options];
    pageViewController.delegate = self;
    pageViewController.dataSource = self;
    
    for (UIView *subview in pageViewController.view.subviews) {
        if([subview isKindOfClass:UIScrollView.class]){
            ((UIScrollView *)subview).delegate = self;
            ((UIScrollView *)subview).keyboardDismissMode = _dismissKeyboard;
            ((UIScrollView *)subview).delaysContentTouches = NO;
            self.scrollView = (UIScrollView *)subview;
        }
    }
        
    self.reactPageViewController = pageViewController;
        
    UIPageControl *pageIndicatorView = [self createPageIndicator];
    
    pageIndicatorView.numberOfPages = self.reactSubviews.count;
    pageIndicatorView.currentPage = self.initialPage;
    pageIndicatorView.hidden = !self.showPageIndicator;
    
    self.reactPageIndicatorView = pageIndicatorView;
    
    [self reactAddControllerToClosestParent:pageViewController];
    [pageViewController.view addSubview:pageIndicatorView];
    [self addSubview:pageViewController.view];
    
    pageViewController.view.frame = self.bounds;
    
    [self shouldScroll:self.scrollEnabled];
    
    if (@available(iOS 9.0, *)) {
        pageIndicatorView.translatesAutoresizingMaskIntoConstraints = NO;
        NSLayoutConstraint *bottomConstraint = [pageIndicatorView.bottomAnchor constraintEqualToAnchor: pageViewController.view.bottomAnchor constant:0];
        NSLayoutConstraint *leadingConstraint = [pageIndicatorView.leadingAnchor constraintEqualToAnchor: pageViewController.view.leadingAnchor constant:0];
        NSLayoutConstraint *trailingConstraint = [pageIndicatorView.trailingAnchor constraintEqualToAnchor: pageViewController.view.trailingAnchor constant:0];
        
        [NSLayoutConstraint activateConstraints:@[bottomConstraint, leadingConstraint, trailingConstraint]];
    }
    [pageViewController.view layoutIfNeeded];
}

- (void)shouldScroll:(BOOL)scrollEnabled {
    _scrollEnabled = scrollEnabled;
    if (self.reactPageViewController.view) {
        self.scrollView.scrollEnabled = scrollEnabled;
    }
}

- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard {
    _dismissKeyboard = [dismissKeyboard  isEqual: @"on-drag"] ?
    UIScrollViewKeyboardDismissModeOnDrag : UIScrollViewKeyboardDismissModeNone;
    self.scrollView.keyboardDismissMode = _dismissKeyboard;
}

- (void)setupInitialController {
    UIView *initialView = self.reactSubviews[self.initialPage];
    if (initialView) {
        UIViewController *initialController = [[UIViewController alloc] initWithView:initialView];
        [self.cachedControllers addObject:initialController];
        
        [self setReactViewControllers:self.initialPage
                                 with:initialController
                            direction:UIPageViewControllerNavigationDirectionForward
                             animated:YES];
    }
}

- (void)setReactViewControllers:(NSInteger)index
                           with:(UIViewController *)controller
                      direction:(UIPageViewControllerNavigationDirection)direction
                       animated:(BOOL)animated {
    __weak ReactNativePageView *weakSelf = self;
    uint16_t coalescingKey = _coalescingKey++;
    
    [self.reactPageViewController setViewControllers:@[controller]
                                           direction:direction
                                            animated:animated
                                          completion:^(BOOL finished) {
        
        weakSelf.currentIndex = index;
        weakSelf.currentView = controller.view;
        
        if (weakSelf.eventDispatcher) {
            [weakSelf.eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:weakSelf.reactTag position:@(index) coalescingKey:coalescingKey]];
        }
        
    }];
}

- (UIViewController *)currentlyDisplayed {
    return self.reactPageViewController.viewControllers.firstObject;
}

- (UIViewController *)findCachedControllerForView:(UIView *)view {
    for (UIViewController *controller in self.cachedControllers) {
        if (controller.view.reactTag == view.reactTag) {
            return controller;
        }
    }
    return nil;
}

- (void)updateDataSource {
    if (!self.currentView) {
        return;
    }
    
    NSInteger newIndex = [self.reactSubviews indexOfObject:self.currentView];
    
    if (newIndex == NSNotFound) {
        // Current view was removed
        [self goTo:self.currentIndex animated:NO];
    } else {
        [self goTo:newIndex animated:NO];
    }
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    NSInteger numberOfPages = self.reactSubviews.count;
    
    if (numberOfPages == 0 || index < 0) {
        return;
    }
        
    UIPageViewControllerNavigationDirection direction = (index > self.currentIndex) ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
    
    NSInteger indexToDisplay = index < numberOfPages ? index : numberOfPages - 1;
    
    UIView *viewToDisplay = self.reactSubviews[indexToDisplay];
    UIViewController *controllerToDisplay = [self findAndCacheControllerForView:viewToDisplay];

    self.reactPageIndicatorView.numberOfPages = numberOfPages;
    self.reactPageIndicatorView.currentPage = indexToDisplay;
        
    [self setReactViewControllers:indexToDisplay
                             with:controllerToDisplay
                        direction:direction
                         animated:animated];
    
}

- (UIViewController *)findAndCacheControllerForView:(UIView *)viewToDisplay {
    if (!viewToDisplay) { return nil; }
    
    UIViewController *controllerToDisplay = [self findCachedControllerForView:viewToDisplay];
    UIViewController *current = [self currentlyDisplayed];

    if (!controllerToDisplay && current.view.reactTag == viewToDisplay.reactTag) {
        controllerToDisplay = current;
    }
    if (!controllerToDisplay) {
         controllerToDisplay = [[UIViewController alloc] initWithView:viewToDisplay];
    }
    [self.cachedControllers addObject:controllerToDisplay];
    
    return controllerToDisplay;
}

- (UIViewController *)nextControllerForController:(UIViewController *)controller
                                      inDirection:(UIPageViewControllerNavigationDirection)direction {
    NSUInteger numberOfPages = self.reactSubviews.count;
    NSInteger index = [self.reactSubviews indexOfObject:controller.view];
    
    if (index == NSNotFound) {
        return nil;
    }
    
    direction == UIPageViewControllerNavigationDirectionForward ? index++ : index--;

    if (index < 0 || (index > (numberOfPages - 1))) {
        return nil;
    }
    
    UIView *viewToDisplay = self.reactSubviews[index];
    
    return [self findAndCacheControllerForView:viewToDisplay];
}

#pragma mark - UIPageViewControllerDelegate

- (void)pageViewController:(UIPageViewController *)pageViewController
        didFinishAnimating:(BOOL)finished
   previousViewControllers:(nonnull NSArray<UIViewController *> *)previousViewControllers
       transitionCompleted:(BOOL)completed {
    
    if (completed) {
        UIViewController* currentVC = [self currentlyDisplayed];
        NSUInteger currentIndex = [self.reactSubviews indexOfObject:currentVC.view];
        
        self.currentIndex = currentIndex;
        
        self.currentView = currentVC.view;
        self.reactPageIndicatorView.currentPage = currentIndex;
        
        [self.eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:self.reactTag position:@(currentIndex) coalescingKey:_coalescingKey++]];
        [self.eventDispatcher sendEvent:[[RCTOnPageScrollEvent alloc] initWithReactTag:self.reactTag position:@(currentIndex) offset:@(0.0)]];
    }
}

#pragma mark - UIPageViewControllerDataSource

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
    return [self nextControllerForController:viewController inDirection:UIPageViewControllerNavigationDirectionForward];
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
    return [self nextControllerForController:viewController inDirection:UIPageViewControllerNavigationDirectionReverse];
}

#pragma mark - UIPageControlDelegate

- (void)shouldShowPageIndicator:(BOOL)showPageIndicator {
    _showPageIndicator = showPageIndicator;
    
    if (self.reactPageIndicatorView) {
        self.reactPageIndicatorView.hidden = !showPageIndicator;
    }
}

- (UIPageControl *)createPageIndicator {
    UIPageControl *pageControl = [[UIPageControl alloc] init];
    pageControl.tintColor = UIColor.blackColor;
    pageControl.pageIndicatorTintColor = UIColor.whiteColor;
    pageControl.currentPageIndicatorTintColor = UIColor.blackColor;
    [pageControl addTarget:self
                    action:@selector(pageControlValueChanged:)
          forControlEvents:UIControlEventValueChanged];
    
    return pageControl;
}

- (void)pageControlValueChanged:(UIPageControl *)sender {
    if (sender.currentPage != self.currentIndex) {
        [self goTo:sender.currentPage animated:YES];
    }
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"dragging" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"settling" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"idle" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    CGPoint point = scrollView.contentOffset;
    float offset = 0;
    if (self.orientation == UIPageViewControllerNavigationOrientationHorizontal) {
        if (self.frame.size.width != 0) {
            offset = (point.x - self.frame.size.width)/self.frame.size.width;
        }
    } else {
        if (self.frame.size.height != 0) {
            offset = (point.y - self.frame.size.height)/self.frame.size.height;
        }
    }
    if(fabs(offset) > 1) {
        offset = offset > 0 ? 1.0 : -1.0;
    }
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollEvent alloc] initWithReactTag:self.reactTag position:@(self.currentIndex) offset:@(offset)]];
}

@end
