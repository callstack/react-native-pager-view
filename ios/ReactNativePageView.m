#import "ReactNativePageView.h"
#import "React/RCTLog.h"
#import <React/RCTViewManager.h>

#import "UIViewController+CreateExtension.h"
#import "RCTOnPageScrollEvent.h"
#import "RCTOnPageScrollStateChanged.h"
#import "RCTOnPageSelected.h"

@interface ReactNativePageView () <UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate>

@property(nonatomic, strong) NSMapTable<UIView *, UIViewController *> *controllerCache;
@property NSInteger currentPage;
@property NSNumber *currentReactTag;
@property(nonatomic, strong) NSMapTable<UIViewController *, NSNumber *> *placeholderPageIndexes;
@property(nonatomic, strong) UIPageControl *reactPageIndicatorView;
@property(nonatomic, strong) UIPageViewController *reactPageViewController;
@property(nonatomic, weak) UIScrollView *scrollView;

@end


@implementation ReactNativePageView

- (instancetype)init {
    if (self = [super init]) {
        _controllerCache = [NSMapTable weakToWeakObjectsMapTable];
        _currentPage = 0;
        _currentReactTag = nil;
        _orientation = UIPageViewControllerNavigationOrientationHorizontal;
        _overdrag = NO;
        _pageMargin = 0;
        _placeholderPageIndexes = [NSMapTable weakToStrongObjectsMapTable];
        _scrollEnabled = YES;
        _showPageIndicator = NO;
        _transitionStyle = UIPageViewControllerTransitionStyleScroll;
        [self embed];
        return self;
    } else {
        return nil;
    }
}

- (void)layoutSubviews {
    [super layoutSubviews];
    if (_reactPageViewController) {
        [self goTo:_currentPage animated:NO];
    }
}

- (void)didUpdateReactSubviews {
    NSInteger targetPage = _currentPage;
    NSInteger reactIndex = [self getReactIndexOfView:_currentReactTag];
    if (reactIndex != NSNotFound) {
        targetPage = _offset + reactIndex;
    }
    [self goTo:targetPage animated:NO];
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    if (
        [changedProps containsObject:@"orientation"]
        || [changedProps containsObject:@"pageMargin"]
        || [changedProps containsObject:@"transitionStyle"]) {
        [self embed];
        [self goTo:_currentPage animated:NO];
    } else {
        if ([changedProps containsObject:@"scrollEnabled"] && _scrollView) {
            _scrollView.scrollEnabled = _scrollEnabled;
        }
        if ([changedProps containsObject:@"showPageIndicator"]) {
            _reactPageIndicatorView.hidden = !_showPageIndicator;
        }
    }
}

- (void)embed {
    if (_reactPageViewController) {
        // Need to reinitialize.
        [_reactPageViewController.view removeFromSuperview];
    }

    NSDictionary *options = @{ UIPageViewControllerOptionInterPageSpacingKey: @(_pageMargin) };
    _reactPageViewController = [[UIPageViewController alloc] initWithTransitionStyle:_transitionStyle
                                                                   navigationOrientation:_orientation
                                                                                 options:options];
    _reactPageViewController.dataSource = self;
    _reactPageViewController.delegate = self;
    [self addSubview:_reactPageViewController.view];

    for (UIView *subview in _reactPageViewController.view.subviews) {
        if([subview isKindOfClass:UIScrollView.class]) {
            _scrollView = (UIScrollView *)subview;
            _scrollView.delegate = self;
            _scrollView.scrollEnabled = _scrollEnabled;
            break;
        }
    }

    [self attachPageIndicator];
}

- (void)attachPageIndicator {
    UIPageControl *pageIndicatorView = [[UIPageControl alloc] init];
    pageIndicatorView.tintColor = UIColor.blackColor;
    pageIndicatorView.pageIndicatorTintColor = UIColor.whiteColor;
    pageIndicatorView.currentPageIndicatorTintColor = UIColor.blackColor;
    [pageIndicatorView addTarget:self
                          action:@selector(pageControlValueChanged:)
                forControlEvents:UIControlEventValueChanged];
    pageIndicatorView.numberOfPages = _count;
    pageIndicatorView.currentPage = _currentPage;
    pageIndicatorView.hidden = !_showPageIndicator;

    [_reactPageViewController.view addSubview:pageIndicatorView];
    _reactPageIndicatorView = pageIndicatorView;

    UIView *pageViewControllerView = _reactPageViewController.view;
    pageIndicatorView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *bottomConstraint = [pageIndicatorView.bottomAnchor constraintEqualToAnchor: pageViewControllerView.bottomAnchor constant:0];
    NSLayoutConstraint *leadingConstraint = [pageIndicatorView.leadingAnchor constraintEqualToAnchor: pageViewControllerView.leadingAnchor constant:0];
    NSLayoutConstraint *trailingConstraint = [pageIndicatorView.trailingAnchor constraintEqualToAnchor: pageViewControllerView.trailingAnchor constant:0];
    [NSLayoutConstraint activateConstraints:@[bottomConstraint, leadingConstraint, trailingConstraint]];
}

- (void)pageControlValueChanged:(UIPageControl *)sender {
    if (sender.currentPage != _currentPage) {
        [self goTo:sender.currentPage animated:YES];
    }
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    index = MIN(_count - 1, index);
    UIViewController *controller = [self getControllerAtPosition:index];
    if (!controller) {
        return;
    }

    _reactPageIndicatorView.numberOfPages = _count;
    _reactPageIndicatorView.currentPage = index;

    __weak ReactNativePageView *weakSelf = self;
    [_reactPageViewController setViewControllers:@[controller]
                                           direction:index < _currentPage ? UIPageViewControllerNavigationDirectionReverse : UIPageViewControllerNavigationDirectionForward
                                            animated:animated
                                          completion:^(BOOL finished) {
        if (weakSelf && weakSelf.currentPage != index) {
            weakSelf.currentPage = index;
            weakSelf.currentReactTag = controller.view ? controller.view.reactTag : nil;
            if (weakSelf.onPageSelected) {
                weakSelf.onPageSelected(@{
                    @"position": [NSNumber numberWithInteger:weakSelf.currentPage]
                });
            }
        }
    }];
    _reactPageViewController.view.frame = self.bounds;
    [_reactPageViewController.view layoutIfNeeded];
}

- (void)shouldScroll:(BOOL)scrollEnabled {
    _scrollEnabled = scrollEnabled;
    if (_reactPageViewController.view) {
        _scrollView.scrollEnabled = scrollEnabled;
    }
}

- (UIViewController *)getControllerAtPosition:(NSInteger)position {
    if (position < 0 || position >= _count) {
        return nil;
    }
    UIViewController *controller;
    UIView *reactView = [self getViewAtPosition:position];
    if (reactView) {
        controller = [self getControllerForView:reactView];
    } else {
        // Not yet rendered? Give placeholder.
        controller = [UIViewController alloc];
        [_placeholderPageIndexes setObject:[NSNumber numberWithInteger:position] forKey:controller];
    }

    return controller;
}

- (UIViewController *)getControllerForView:(UIView *)view {
    UIViewController *controller = [_controllerCache objectForKey:view];
    if (!controller) {
        controller = [UIViewController alloc];
        controller.view = view;
        [_controllerCache setObject:controller forKey:view];
    }
    return controller;
}

- (NSInteger)getPositionOfController:(UIViewController *)controller {
    if (controller.view != nil) {
        NSInteger reactIndex = [self getReactIndexOfView:controller.view.reactTag];
        if (reactIndex != NSNotFound) {
            return _offset + reactIndex;
        }
    }
    NSNumber *pageIndex = [_placeholderPageIndexes objectForKey:controller];
    if (!pageIndex) {
        return NSNotFound;
    }
    return [pageIndex integerValue];
}

- (NSInteger)getReactIndexOfView:(NSNumber *)reactTag {
    return [self.reactSubviews indexOfObjectPassingTest:
            ^BOOL(UIView *view, NSUInteger idx, BOOL *stop) {
        return view.reactTag == reactTag;
    }];
}

- (UIView *)getViewAtPosition:(NSInteger)position {
    NSInteger index = position - _offset;
    if (index >= 0 && index < self.reactSubviews.count) {
        return self.reactSubviews[index];
    }
    return nil;
}

#pragma mark - UIPageViewControllerDataSource

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
    NSInteger position = [self getPositionOfController:viewController];
    if (position != NSNotFound) {
        return [self getControllerAtPosition:position + 1];
    }
    return nil;
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
    NSInteger position = [self getPositionOfController:viewController];
    if (position != NSNotFound) {
        return [self getControllerAtPosition:position - 1];
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
    NSInteger position = [self getPositionOfController:controller];
    if (position == NSNotFound) {
        return;
    }
    _currentPage = position;
    _currentReactTag = controller.view ? controller.view.reactTag : nil;
    _reactPageIndicatorView.currentPage = position;

    if (_onPageSelected) {
        _onPageSelected(@{
            @"position": [NSNumber numberWithInteger:position]
        });
    }
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    if (_onPageScrollStateChanged) {
        _onPageScrollStateChanged(@{
            @"pageScrollState": @"dragging"
        });
    }
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    if (_onPageScrollStateChanged) {
        _onPageScrollStateChanged(@{
            @"pageScrollState": @"settling"
        });
    }

    if (!_overdrag) {
        if (_currentPage == 0 && scrollView.contentOffset.x <= scrollView.bounds.size.width) {
            *targetContentOffset = CGPointMake(scrollView.bounds.size.width, 0);
        } else if (_currentPage == _count -1 && scrollView.contentOffset.x >= scrollView.bounds.size.width) {
            *targetContentOffset = CGPointMake(scrollView.bounds.size.width, 0);
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    if (_onPageScrollStateChanged) {
        _onPageScrollStateChanged(@{
            @"pageScrollState": @"idle"
        });
    }
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (!_overdrag) {
        if (_orientation == UIPageViewControllerNavigationOrientationHorizontal) {
            if (_currentPage == 0 && scrollView.contentOffset.x < scrollView.bounds.size.width) {
                scrollView.contentOffset = CGPointMake(scrollView.bounds.size.width, 0);
            } else if (_currentPage == _count - 1 && scrollView.contentOffset.x > scrollView.bounds.size.width) {
                scrollView.contentOffset = CGPointMake(scrollView.bounds.size.width, 0);
            }
        } else {
            if (_currentPage == 0 && scrollView.contentOffset.y < scrollView.bounds.size.height) {
                scrollView.contentOffset = CGPointMake(0, scrollView.bounds.size.height);
            } else if (_currentPage == _count - 1 && scrollView.contentOffset.y > scrollView.bounds.size.height) {
                scrollView.contentOffset = CGPointMake(0, scrollView.bounds.size.height);
            }
        }
    }

    if (!_onPageScroll) {
        return;
    }
    CGPoint point = scrollView.contentOffset;
    float offset = 0;
    if (_orientation == UIPageViewControllerNavigationOrientationHorizontal) {
        if (self.frame.size.width != 0) {
            offset = (point.x - self.frame.size.width) / self.frame.size.width;
        }
    } else {
        if (self.frame.size.height != 0) {
            offset = (point.y - self.frame.size.height) / self.frame.size.height;
        }
    }
    if (fabs(offset) > 1) {
        offset = offset > 0 ? 1.0 : -1.0;
    }
    NSInteger position = _currentPage;
    if (offset < 0 && position > 0) {
        offset += 1;
        position -= 1;
    }
    _onPageScroll(@{
        @"offset": [NSNumber numberWithFloat:offset],
        @"position": [NSNumber numberWithInteger:position]
    });
}

@end
