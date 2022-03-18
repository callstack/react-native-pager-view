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
#import "RNCPagerViewCommands.h"


using namespace facebook::react;

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol, UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate>
@end

@implementation RNCPagerViewComponentView {
    UIScrollView *scrollView;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNCViewPagerProps>();
    _props = defaultProps;
    _nativeChildrenViewControllers = [[NSMutableArray alloc] init];
    _currentIndex = -1;
  }
  return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    //Workaround to fix incorrect frame issue
    [self goTo:_currentIndex animated:NO];

}

#pragma mark - React API

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
    if (!_nativePageViewController) {
        const auto &viewProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
        NSDictionary *options = @{ UIPageViewControllerOptionInterPageSpacingKey: @(viewProps.pageMargin) };
        UIPageViewControllerNavigationOrientation orientation = UIPageViewControllerNavigationOrientationHorizontal;
        switch (viewProps.orientation) {
            case RNCViewPagerOrientation::Horizontal:
                orientation = UIPageViewControllerNavigationOrientationHorizontal;
                break;
            case RNCViewPagerOrientation::Vertical:
                orientation = UIPageViewControllerNavigationOrientationVertical;
                break;
        }
        _nativePageViewController = [[UIPageViewController alloc]
                                       initWithTransitionStyle: UIPageViewControllerTransitionStyleScroll
                                       navigationOrientation:orientation
                                       options:options];
        _nativePageViewController.dataSource = self;
        _nativePageViewController.delegate = self;
        [self addSubview:_nativePageViewController.view];
    }
    UIViewController *wrapper = [[UIViewController alloc] initWithView:childComponentView];
    [_nativeChildrenViewControllers insertObject:wrapper atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
    [[_nativeChildrenViewControllers objectAtIndex:index].view removeFromSuperview];
    [_nativeChildrenViewControllers objectAtIndex:index].view = nil;
    [_nativeChildrenViewControllers removeObjectAtIndex:index];
    [_nativePageViewController.view removeFromSuperview];
    _nativePageViewController = nil;
}

- (void)shouldDismissKeyboard:(RNCViewPagerKeyboardDismissMode)dismissKeyboard {
    UIScrollViewKeyboardDismissMode dismissKeyboardMode = UIScrollViewKeyboardDismissModeNone;
    switch (dismissKeyboard) {
      case RNCViewPagerKeyboardDismissMode::None:
            dismissKeyboardMode = UIScrollViewKeyboardDismissModeNone;
            break;
      case RNCViewPagerKeyboardDismissMode::OnDrag:
            dismissKeyboardMode = UIScrollViewKeyboardDismissModeOnDrag;
            break;
    }
    scrollView.keyboardDismissMode = dismissKeyboardMode;
}

- (void)updateProps:(const facebook::react::Props::Shared &)props oldProps:(const facebook::react::Props::Shared &)oldProps{
    const auto &oldScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
    const auto &newScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(props);
    // change index only once
    if (_currentIndex == -1) {
        _currentIndex = newScreenProps.initialPage;
        for (UIView *subview in _nativePageViewController.view.subviews) {
             if([subview isKindOfClass:UIScrollView.class]){
                 ((UIScrollView *)subview).delegate = self;
                 ((UIScrollView *)subview).delaysContentTouches = NO;
                 scrollView = (UIScrollView *)subview;
                 [self shouldDismissKeyboard: newScreenProps.keyboardDismissMode];
             }
         }
    }
    
    if (oldScreenProps.keyboardDismissMode != newScreenProps.keyboardDismissMode) {
        [self shouldDismissKeyboard: newScreenProps.keyboardDismissMode];
    }
    
    if (newScreenProps.scrollEnabled != scrollView.scrollEnabled) {
        scrollView.scrollEnabled = newScreenProps.scrollEnabled;
    }
    
    [super updateProps:props oldProps:oldProps];
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args {
    RNCPagerViewCommands(self, commandName, args);
}

#pragma mark - Internal methods

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    NSInteger numberOfPages = _nativeChildrenViewControllers.count;
    
    if (numberOfPages == 0 || index < 0 || index > numberOfPages - 1) {
        return;
    }
  //TODO
//    BOOL isForward = (index > self.currentIndex && [self isLtrLayout]) || (index < self.currentIndex && ![self isLtrLayout]);
//    UIPageViewControllerNavigationDirection direction = isForward ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
    
    BOOL isForward = (index > self.currentIndex) || (index < self.currentIndex);
    UIPageViewControllerNavigationDirection direction = isForward ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
    
    long diff = labs(index - _currentIndex);
    
    if (isForward && diff > 0) {
        for (NSInteger i=_currentIndex; i<=index; i++) {
            if (i == _currentIndex) {
                continue;
            }
            [self goToViewController:i direction:direction animated:animated shouldCallOnPageSelected: i == index];
        }
    }
    
    if (!isForward && diff > 0) {
        for (NSInteger i=_currentIndex; i>=index; i--) {
            // Prevent removal of one or many pages at a time
            if (index == _currentIndex || i >= numberOfPages) {
                continue;
            }
            [self goToViewController:i direction:direction animated:animated shouldCallOnPageSelected: i == index];
        }
    }
    
    if (diff == 0) {
        [self goToViewController:index direction:direction animated:animated shouldCallOnPageSelected:YES];
    }
}

- (void)goToViewController:(NSInteger)index
                            direction:(UIPageViewControllerNavigationDirection)direction
                            animated:(BOOL)animated
                            shouldCallOnPageSelected:(BOOL)shouldCallOnPageSelected {
    [self setPagerViewControllers:index
                        direction:direction
                         animated:animated
                        shouldCallOnPageSelected:shouldCallOnPageSelected];
}

- (void)setPagerViewControllers:(NSInteger)index
                      direction:(UIPageViewControllerNavigationDirection)direction
                       animated:(BOOL)animated
                       shouldCallOnPageSelected:(BOOL)shouldCallOnPageSelected {
    if (_nativePageViewController == nil) {
        return;
    }

    __weak RNCPagerViewComponentView *weakSelf = self;
    [_nativePageViewController setViewControllers:@[[_nativeChildrenViewControllers objectAtIndex:index]]
                                           direction:direction
                                            animated:animated
                                          completion:^(BOOL finished) {
        __strong typeof(self) strongSelf = weakSelf;
        if (strongSelf->_eventEmitter != nullptr && shouldCallOnPageSelected) {
            const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(strongSelf->_eventEmitter);
            int position = (int) index;
            strongEventEmitter.onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{position : position});
        }
    }];
}


- (UIViewController *)nextControllerForController:(UIViewController *)controller
                                      inDirection:(UIPageViewControllerNavigationDirection)direction {
    NSUInteger numberOfPages = _nativeChildrenViewControllers.count;
    NSInteger index = [_nativeChildrenViewControllers indexOfObject:controller];
    
    if (index == NSNotFound) {
        return nil;
    }
    
    direction == UIPageViewControllerNavigationDirectionForward ? index++ : index--;
    
    if (index < 0 || (index > (numberOfPages - 1))) {
        return nil;
    }
    
    return [_nativeChildrenViewControllers objectAtIndex:index];
}

- (UIViewController *)currentlyDisplayed {
    return _nativePageViewController.viewControllers.firstObject;
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    strongEventEmitter.onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{pageScrollState: RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Dragging });
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    strongEventEmitter.onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{pageScrollState: RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Settling });
// TODO
//    if (!_overdrag) {
//        NSInteger maxIndex = _reactPageIndicatorView.numberOfPages - 1;
//        BOOL isFirstPage = [self isLtrLayout] ? _currentIndex == 0 : _currentIndex == maxIndex;
//        BOOL isLastPage = [self isLtrLayout] ? _currentIndex == maxIndex : _currentIndex == 0;
//        CGFloat contentOffset =[self isHorizontal] ? scrollView.contentOffset.x : scrollView.contentOffset.y;
//        CGFloat topBound = [self isHorizontal] ? scrollView.bounds.size.width : scrollView.bounds.size.height;
//
//        if ((isFirstPage && contentOffset <= topBound) || (isLastPage && contentOffset >= topBound)) {
//            CGPoint croppedOffset = [self isHorizontal] ? CGPointMake(topBound, 0) : CGPointMake(0, topBound);
//            *targetContentOffset = croppedOffset;
//        }
//    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    strongEventEmitter.onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{pageScrollState: RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Idle });
}

- (BOOL)isHorizontal {
    return _nativePageViewController.navigationOrientation == UIPageViewControllerNavigationOrientationHorizontal;
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    CGPoint point = scrollView.contentOffset;
    float offset = 0;
    if (self.isHorizontal) {
        if (self.frame.size.width != 0) {
            offset = (point.x - self.frame.size.width)/self.frame.size.width;
        }
    } else {
        if (self.frame.size.height != 0) {
            offset = (point.y - self.frame.size.height)/self.frame.size.height;
        }
    }
    
    float absoluteOffset = fabs(offset);
    NSInteger position = self.currentIndex;
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    int eventPosition = (int) position;
    strongEventEmitter.onPageScroll(RNCViewPagerEventEmitter::OnPageScroll{position: eventPosition, offset: absoluteOffset});
}

#pragma mark - UIPageViewControllerDelegate

- (void)pageViewController:(UIPageViewController *)pageViewController
        didFinishAnimating:(BOOL)finished
   previousViewControllers:(nonnull NSArray<UIViewController *> *)previousViewControllers
       transitionCompleted:(BOOL)completed {
    if (completed) {
        UIViewController* currentVC = [self currentlyDisplayed];
        NSUInteger currentIndex = [_nativeChildrenViewControllers indexOfObject:currentVC];
        _currentIndex = currentIndex;
        int position = (int) currentIndex;
        const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
        strongEventEmitter.onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{position : position});
        strongEventEmitter.onPageScroll(RNCViewPagerEventEmitter::OnPageScroll{position: position, offset: 0.0});
    }
}

#pragma mark - UIPageViewControllerDataSource

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
    //TODO
//    UIPageViewControllerNavigationDirection direction = [self isLtrLayout] ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
    return [self nextControllerForController:viewController inDirection:UIPageViewControllerNavigationDirectionForward];
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
    //TODO
//    UIPageViewControllerNavigationDirection direction = [self isLtrLayout] ? UIPageViewControllerNavigationDirectionReverse : UIPageViewControllerNavigationDirectionForward;
    return [self nextControllerForController:viewController inDirection:UIPageViewControllerNavigationDirectionReverse];
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
