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
        self.controllerCache = [NSMapTable weakToWeakObjectsMapTable];
        self.currentPage = 0;
        self.currentReactTag = nil;
        self.orientation = UIPageViewControllerNavigationOrientationHorizontal;
        self.overdrag = YES;
        self.pageMargin = 0;
        self.placeholderPageIndexes = [NSMapTable weakToStrongObjectsMapTable];
        self.scrollEnabled = YES;
        self.showPageIndicator = NO;
        self.transitionStyle = UIPageViewControllerTransitionStyleScroll;
        [self embed];
        return self;
    } else {
        return nil;
    }
}

- (void)didUpdateReactSubviews {
    NSInteger targetPage = self.currentPage;
    NSInteger reactIndex = [self getReactIndexOfView:self.currentReactTag];
    if (reactIndex != NSNotFound) {
        targetPage = self.offset + reactIndex;
    }
    [self goTo:targetPage animated:NO];
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    if (
        [changedProps containsObject:@"orientation"]
        || [changedProps containsObject:@"pageMargin"]
        || [changedProps containsObject:@"transitionStyle"]) {
        [self embed];
        [self goTo:self.currentPage animated:NO];
    } else {
        if ([changedProps containsObject:@"scrollEnabled"] && self.scrollView) {
            self.scrollView.scrollEnabled = self.scrollEnabled;
        }
        if ([changedProps containsObject:@"showPageIndicator"]) {
            self.reactPageIndicatorView.hidden = !self.showPageIndicator;
        }
    }
}

- (void)embed {
    if (self.reactPageViewController) {
        // Need to reinitialize.
        [self.reactPageViewController.view removeFromSuperview];
    }

    NSDictionary *options = @{ UIPageViewControllerOptionInterPageSpacingKey: @(self.pageMargin) };
    self.reactPageViewController = [[UIPageViewController alloc] initWithTransitionStyle:self.transitionStyle
                                                                   navigationOrientation:self.orientation
                                                                                 options:options];
    self.reactPageViewController.dataSource = self;
    self.reactPageViewController.delegate = self;
    [self addSubview:self.reactPageViewController.view];

    for (UIView *subview in self.reactPageViewController.view.subviews) {
        if([subview isKindOfClass:UIScrollView.class]) {
            self.scrollView = (UIScrollView *)subview;
            self.scrollView.delegate = self;
            self.scrollView.scrollEnabled = self.scrollEnabled;
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
    pageIndicatorView.numberOfPages = self.count;
    pageIndicatorView.currentPage = self.currentPage;
    pageIndicatorView.hidden = !self.showPageIndicator;

    [self.reactPageViewController.view addSubview:pageIndicatorView];
    self.reactPageIndicatorView = pageIndicatorView;

    UIView *pageViewControllerView = self.reactPageViewController.view;
    pageIndicatorView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *bottomConstraint = [pageIndicatorView.bottomAnchor constraintEqualToAnchor: pageViewControllerView.bottomAnchor constant:0];
    NSLayoutConstraint *leadingConstraint = [pageIndicatorView.leadingAnchor constraintEqualToAnchor: pageViewControllerView.leadingAnchor constant:0];
    NSLayoutConstraint *trailingConstraint = [pageIndicatorView.trailingAnchor constraintEqualToAnchor: pageViewControllerView.trailingAnchor constant:0];
    [NSLayoutConstraint activateConstraints:@[bottomConstraint, leadingConstraint, trailingConstraint]];
}

- (void)pageControlValueChanged:(UIPageControl *)sender {
    if (sender.currentPage != self.currentPage) {
        [self goTo:sender.currentPage animated:YES];
    }
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    index = MIN(self.count - 1, index);
    UIViewController *controller = [self getControllerAtPosition:index];
    if (!controller) {
        return;
    }

    self.reactPageIndicatorView.numberOfPages = self.count;
    self.reactPageIndicatorView.currentPage = index;

    __weak ReactNativePageView *weakSelf = self;
    [self.reactPageViewController setViewControllers:@[controller]
                                           direction:index < self.currentPage ? UIPageViewControllerNavigationDirectionReverse : UIPageViewControllerNavigationDirectionForward
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
    self.reactPageViewController.view.frame = self.bounds;
    [self.reactPageViewController.view layoutIfNeeded];
}

- (void)shouldScroll:(BOOL)scrollEnabled {
    self.scrollEnabled = scrollEnabled;
    if (self.reactPageViewController.view) {
        self.scrollView.scrollEnabled = scrollEnabled;
    }
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
        [self.placeholderPageIndexes setObject:[NSNumber numberWithInteger:position] forKey:controller];
    }

    return controller;
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

- (NSInteger)getPositionOfController:(UIViewController *)controller {
    if (controller.view != nil) {
        NSInteger reactIndex = [self getReactIndexOfView:controller.view.reactTag];
        if (reactIndex != NSNotFound) {
            return self.offset + reactIndex;
        }
    }
    NSNumber *pageIndex = [self.placeholderPageIndexes objectForKey:controller];
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
    NSInteger index = position - self.offset;
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
    self.currentPage = position;
    self.currentReactTag = controller.view ? controller.view.reactTag : nil;
    self.reactPageIndicatorView.currentPage = position;

    if (self.onPageSelected) {
        self.onPageSelected(@{
            @"position": [NSNumber numberWithInteger:position]
        });
    }
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{
            @"pageScrollState": @"dragging"
        });
    }
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{
            @"pageScrollState": @"settling"
        });
    }

    if (!self.overdrag) {
        if (self.currentPage == 0 && scrollView.contentOffset.x <= scrollView.bounds.size.width) {
            *targetContentOffset = CGPointMake(scrollView.bounds.size.width, 0);
        } else if (self.currentPage == self.count -1 && scrollView.contentOffset.x >= scrollView.bounds.size.width) {
            *targetContentOffset = CGPointMake(scrollView.bounds.size.width, 0);
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{
            @"pageScrollState": @"idle"
        });
    }
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (!self.overdrag) {
        if (self.orientation == UIPageViewControllerNavigationOrientationHorizontal) {
            if (self.currentPage == 0 && scrollView.contentOffset.x < scrollView.bounds.size.width) {
                scrollView.contentOffset = CGPointMake(scrollView.bounds.size.width, 0);
            } else if (self.currentPage == self.count - 1 && scrollView.contentOffset.x > scrollView.bounds.size.width) {
                scrollView.contentOffset = CGPointMake(scrollView.bounds.size.width, 0);
            }
        } else {
            if (self.currentPage == 0 && scrollView.contentOffset.y < scrollView.bounds.size.height) {
                scrollView.contentOffset = CGPointMake(0, scrollView.bounds.size.height);
            } else if (self.currentPage == self.count - 1 && scrollView.contentOffset.y > scrollView.bounds.size.height) {
                scrollView.contentOffset = CGPointMake(0, scrollView.bounds.size.height);
            }
        }
    }

    if (!self.onPageScroll) {
        return;
    }
    CGPoint point = scrollView.contentOffset;
    float offset = 0;
    if (self.orientation == UIPageViewControllerNavigationOrientationHorizontal) {
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
    NSInteger position = self.currentPage;
    if (offset < 0 && position > 0) {
        offset += 1;
        position -= 1;
    }
    self.onPageScroll(@{
        @"offset": [NSNumber numberWithFloat:offset],
        @"position": [NSNumber numberWithInteger:position]
    });
}

@end
