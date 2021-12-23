//
//  RNCPagerViewComponentView.m
//  PagerView
//
//  Copyright © 2021 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RNCPagerViewComponentView.h"

#import <react/renderer/components/PagerView/ComponentDescriptors.h>
#import <react/renderer/components/PagerView/EventEmitters.h>
#import <react/renderer/components/PagerView/Props.h>
#import <react/renderer/components/PagerView/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"


using namespace facebook::react;

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol>
@end

@implementation RNCPagerViewComponentView {
    UIPageViewControllerNavigationDirection swipeDirection;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNCViewPagerProps>();
    _props = defaultProps;
      _childrenViewControllers = [[NSMutableArray alloc] init];
      _scrollEnabled = YES;
      _pageMargin = 0;
      _currentIndex = 0;
  }
  return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    if (_reactPageViewController) {
        //Below line fix bug, where the view does not update after orientation changed.
        [self goTo:[NSNumber numberWithInteger:_currentIndex] animated:NO];
    } else {
        [self embed];
    }
}


- (void)embed {
        NSDictionary *options = [NSMutableDictionary
                                 dictionaryWithObjectsAndKeys:
                                 [NSNumber numberWithLong:_pageMargin],
                                 UIPageViewControllerOptionInterPageSpacingKey, nil];
        
        UIPageViewController *reactPageViewController =
        [[UIPageViewController alloc]
         initWithTransitionStyle: UIPageViewControllerTransitionStyleScroll
         navigationOrientation: UIPageViewControllerNavigationOrientationHorizontal
         options:options];
        
        _reactPageViewController = reactPageViewController;
        _reactPageViewController.delegate = self;
        _reactPageViewController.dataSource = self;
        
//        for (UIView *subview in _reactPageViewController.view.subviews) {
//            if([subview isKindOfClass:UIScrollView.class]){
//                ((UIScrollView *)subview).delegate = self;
//                ((UIScrollView *)subview).delaysContentTouches = NO;
//            }
//        }
        
        [self renderChildrenViewControllers];
    [[self parentViewController] addChildViewController:_reactPageViewController];
        [self addSubview:reactPageViewController.view];
        _reactPageViewController.view.frame = [self bounds];
        // Add the page view controller's gesture recognizers to the view controller's view so that the gestures are started more easily.
        self.gestureRecognizers = _reactPageViewController.gestureRecognizers;
        [self.reactPageViewController.view layoutIfNeeded];
}

- (void)renderChildrenViewControllers {
    int index = 0;
    for (UIViewController *vc in _childrenViewControllers) {
        [vc.view removeFromSuperview];
    }
    [_childrenViewControllers removeAllObjects];
    
    for (UIView *view in [self subviews]) {
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
    [_reactPageViewController
     setViewControllers:[NSArray arrayWithObjects:pageViewController, nil]
     direction:direction
     animated:animated
     completion:^(BOOL finished) {
         
     }];
}

- (UIViewController *)createChildViewController:(UIView *)view {
    UIViewController *childViewController = [[UIViewController alloc] init];
    childViewController.view = view;
    return childViewController;
}

- (void)goTo:(NSNumber *)index animated:(BOOL)animated {
    if (_currentIndex >= 0 &&
        index.integerValue < _childrenViewControllers.count) {
        
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

- (UIViewController *)parentViewController {
    UIResponder *responder = [self nextResponder];
    while (responder != nil) {
        if ([responder isKindOfClass:[UIViewController class]]) {
            return (UIViewController *)responder;
        }
        responder = [responder nextResponder];
    }
    return nil;
}

#pragma mark - Delegate

- (void)pageViewController:(UIPageViewController *)pageViewController
willTransitionToViewControllers:
(NSArray<UIViewController *> *)pendingViewControllers {
    if (pendingViewControllers.count == 1) {
        NSUInteger index = [_childrenViewControllers indexOfObject:[pendingViewControllers objectAtIndex:0]];
        swipeDirection = (index > _currentIndex)
        ? UIPageViewControllerNavigationDirectionForward
        : UIPageViewControllerNavigationDirectionReverse;
    } else {
        RCTLog(@"Only one screen support");
    }
}

- (void)pageViewController:(UIPageViewController *)pageViewController
        didFinishAnimating:(BOOL)finished
   previousViewControllers: (nonnull NSArray<UIViewController *> *)previousViewControllers
       transitionCompleted:(BOOL)completed {
    if (completed) {
        UIViewController* currentVC = pageViewController.viewControllers[0];
        _currentIndex = [_childrenViewControllers indexOfObject:currentVC];
//        [_eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:self.reactTag position:[NSNumber numberWithInteger:_currentIndex] coalescingKey:_coalescingKey++]];
//
//        [_eventDispatcher sendEvent:[[RCTOnPageScrollEvent alloc] initWithReactTag:self.reactTag position:[NSNumber numberWithInteger:_currentIndex] offset:[NSNumber numberWithFloat:0] coalescingKey:_coalescingKey++]];
//        _reactPageIndicatorView.currentPage = _currentIndex;
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

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNCViewPagerComponentDescriptor>();
}


@end

Class<RCTComponentViewProtocol> RNCViewPagerCls(void)
{
  return RNCPagerViewComponentView.class;
}
