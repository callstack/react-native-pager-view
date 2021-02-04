
#import "ReactNativePageView.h"

@interface ReactNativePageView () <UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate>

@property(nonatomic, strong) NSMapTable<UIView *, UIViewController *> *controllerCache;
@property NSInteger currentPage;
@property(nonatomic, strong) NSMapTable<UIViewController *, NSNumber *> *pageIndexes;
@property(nonatomic, strong) UIPageViewController *reactPageViewController;

@property(nonatomic, weak) UIScrollView *scrollView;

@end

@implementation ReactNativePageView {
    uint16_t _coalescingKey;
}

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher {
    if (self = [super init]) {
        _controllerCache = [NSMapTable weakToWeakObjectsMapTable];
        _currentPage = 0;
        _pageIndexes = [NSMapTable weakToStrongObjectsMapTable];
        _reactPageViewController = [[UIPageViewController alloc] initWithTransitionStyle:UIPageViewControllerTransitionStyleScroll navigationOrientation:UIPageViewControllerNavigationOrientationHorizontal options:nil];
        _reactPageViewController.dataSource = self;
        _reactPageViewController.delegate = self;
        [self addSubview:_reactPageViewController.view];

        for (UIView *subview in _reactPageViewController.view.subviews) {
            if([subview isKindOfClass:UIScrollView.class]) {
                _scrollView = (UIScrollView *)subview;
                _scrollView.delegate = self;
                break;
            }
        }
    }
    return self;
}

- (void)didUpdateReactSubviews {
    UIViewController *controller = [self getControllerAtPosition:self.currentPage];
    if (controller) {
        [self.reactPageViewController setViewControllers:@[controller] direction:UIPageViewControllerNavigationDirectionForward animated:false completion:nil];
        self.reactPageViewController.view.frame = self.bounds;
        [self.reactPageViewController.view layoutIfNeeded];
    }
}

- (UIViewController *)getControllerForView:(UIView *)view {
    UIViewController *controller = [self.controllerCache objectForKey:view];
    if (!controller) {
        controller = [UIViewController alloc];
        controller.view = view;
        [self.controllerCache setObject:controller forKey:view];
    }
    return controller;
}

- (UIViewController *)getControllerAtPosition:(NSInteger)position {
    if (position < 0 || position >= self.count) {
        return nil;
    }
    UIViewController *controller;
    UIView *reactView = [self getViewAtPosition:position];
    if (reactView) {
        controller = [self getControllerForView:reactView];
    } else {
        // Not yet rendered? Give placeholder.
        controller = [UIViewController alloc];
    }

    [self.pageIndexes setObject:[NSNumber numberWithInteger:position] forKey:controller];
    return controller;
}

- (UIView *)getViewAtPosition:(NSInteger)position {
    NSInteger index = position - self.offset;
    if (index >= 0 && index < self.reactSubviews.count) {
        return self.reactSubviews[index];
    }
    return nil;
}

#pragma mark - UIPageViewControllerDelegate

- (void)pageViewController:(UIPageViewController *)pageViewController
        didFinishAnimating:(BOOL)finished
   previousViewControllers:(nonnull NSArray<UIViewController *> *)previousViewControllers
       transitionCompleted:(BOOL)completed {
    if (!completed) {
        return;
    }
    UIViewController* controller = pageViewController.viewControllers.firstObject;
    NSNumber *pageIndex = [self.pageIndexes objectForKey:controller];
    if (!pageIndex) {
        return;
    }
    self.currentPage = [pageIndex integerValue];

    self.onPageSelected(@{
        @"position": [NSNumber numberWithInteger:self.currentPage]
    });
}

#pragma mark - UIPageViewControllerDataSource

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
    NSNumber *pageIndex = [self.pageIndexes objectForKey:viewController];
    if (pageIndex) {
        return [self getControllerAtPosition:[pageIndex integerValue] + 1];
    }
    return nil;
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
    NSNumber *pageIndex = [self.pageIndexes objectForKey:viewController];
    if (pageIndex) {
        return [self getControllerAtPosition:[pageIndex integerValue] - 1];
    }
    return nil;
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    CGPoint point = scrollView.contentOffset;
    float offset = 0;
    if (self.frame.size.width != 0) {
        offset = (point.x - self.frame.size.width) / self.frame.size.width;
    }
    if (fabs(offset) > 1) {
        offset = offset > 0 ? 1.0 : -1.0;
    }
    self.onPageScroll(@{
        @"offset": [NSNumber numberWithFloat:offset],
        @"position": [NSNumber numberWithInteger:self.currentPage]
    });
}

@end
