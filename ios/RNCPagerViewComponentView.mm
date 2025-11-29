#import <Foundation/Foundation.h>
#import "RNCPagerViewComponentView.h"
#import <react/renderer/components/pagerview/ComponentDescriptors.h>
#import <react/renderer/components/pagerview/EventEmitters.h>
#import <react/renderer/components/pagerview/Props.h>
#import <react/renderer/components/pagerview/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "React/RCTConversions.h"

#import "RCTOnPageScrollEvent.h"

using namespace facebook::react;

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol, UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate>

@property(nonatomic, strong) UIPageViewController *nativePageViewController;
@property(nonatomic, strong) NSMutableArray<UIViewController *> *nativeChildrenViewControllers;

@end

@implementation RNCPagerViewComponentView {
    LayoutMetrics _layoutMetrics;
    LayoutMetrics _oldLayoutMetrics;
    UIScrollView *scrollView;
    BOOL transitioning;
    NSInteger _currentIndex;
    NSInteger _destinationIndex;
    BOOL _overdrag;
    NSString *_layoutDirection;
    BOOL _scrollEnabled;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (void)initializeNativePageViewController {
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
    _nativePageViewController.view.frame = self.frame;
    self.contentView = _nativePageViewController.view;
    
    for (UIView *subview in _nativePageViewController.view.subviews) {
        if([subview isKindOfClass:UIScrollView.class]){
            ((UIScrollView *)subview).delegate = self;
            ((UIScrollView *)subview).delaysContentTouches = NO;
            scrollView = (UIScrollView *)subview;
        }
    }
    
    [self applyScrollEnabled];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNCViewPagerProps>();
        _props = defaultProps;
        _nativeChildrenViewControllers = [[NSMutableArray alloc] init];
        _currentIndex = -1;
        _destinationIndex = -1;
        _layoutDirection = @"ltr";
        _overdrag = NO;
        _scrollEnabled = YES;
    }
    
    return self;
}

- (void)willMoveToSuperview:(UIView *)newSuperview {
    if (newSuperview != nil) {
        [self initializeNativePageViewController];
        [self goTo:_currentIndex animated:NO];
    }
}


#pragma mark - React API

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
    UIViewController *vc = [UIViewController new];
    [vc.view addSubview:childComponentView];
    [_nativeChildrenViewControllers insertObject:vc atIndex:index];
    [self goTo:_currentIndex animated:NO];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
    [childComponentView removeFromSuperview];
    [_nativeChildrenViewControllers removeObjectAtIndex:index];
 
    NSInteger maxPage = _nativeChildrenViewControllers.count - 1;
    
    if (_currentIndex >= maxPage) {
        [self goTo:maxPage animated:NO];
    }
}


-(void)updateLayoutMetrics:(const facebook::react::LayoutMetrics &)layoutMetrics oldLayoutMetrics:(const facebook::react::LayoutMetrics &)oldLayoutMetrics {
    _oldLayoutMetrics = oldLayoutMetrics;
    _layoutMetrics = layoutMetrics;
  
    if (transitioning) {
      return;
    }
  
    [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:_layoutMetrics];
}


-(void)prepareForRecycle {
    [super prepareForRecycle];
    _nativePageViewController = nil;
    _currentIndex = -1;
    _scrollEnabled = YES;
}

- (void)shouldDismissKeyboard:(RNCViewPagerKeyboardDismissMode)dismissKeyboard {
#if !TARGET_OS_VISION
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
#endif
}

- (void)applyScrollEnabled {
  scrollView.scrollEnabled = _scrollEnabled;
}


- (void)updateProps:(const facebook::react::Props::Shared &)props oldProps:(const facebook::react::Props::Shared &)oldProps{
    const auto &oldScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
    const auto &newScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(props);
    
    // change index only once
    if (_currentIndex == -1) {
        _currentIndex = newScreenProps.initialPage;
        [self shouldDismissKeyboard: newScreenProps.keyboardDismissMode];
    }
    
    const auto newLayoutDirectionStr = RCTNSStringFromString(toString(newScreenProps.layoutDirection));
    
    
    if (_layoutDirection != newLayoutDirectionStr) {
        _layoutDirection = newLayoutDirectionStr;
    }
    
    if (oldScreenProps.keyboardDismissMode != newScreenProps.keyboardDismissMode) {
        [self shouldDismissKeyboard: newScreenProps.keyboardDismissMode];
    }
    
    if (oldScreenProps.scrollEnabled != newScreenProps.scrollEnabled) {
        _scrollEnabled = newScreenProps.scrollEnabled;
        [self applyScrollEnabled];
    }
    
    if (newScreenProps.overdrag != _overdrag) {
        _overdrag = newScreenProps.overdrag;
    }
    
    [super updateProps:props oldProps:oldProps];
}


#pragma mark - Internal methods

- (void)disableSwipe {
    self.nativePageViewController.view.userInteractionEnabled = NO;
}

- (void)enableSwipe {
    self.nativePageViewController.view.userInteractionEnabled = YES;
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    NSInteger numberOfPages = _nativeChildrenViewControllers.count;
    
    [self disableSwipe];
    
    _destinationIndex = index;
    
    
    if (numberOfPages == 0 || index < 0 || index > numberOfPages - 1) {
        return;
    }
    
    BOOL isForward = (index > _currentIndex && [self isLtrLayout]) || (index < _currentIndex && ![self isLtrLayout]);
    UIPageViewControllerNavigationDirection direction = isForward ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
    
    long diff = labs(index - _currentIndex);
    
    [self setPagerViewControllers:index
                        direction:direction
                         animated:diff == 0 ? NO : animated];
    
}

- (void)setPagerViewControllers:(NSInteger)index
                      direction:(UIPageViewControllerNavigationDirection)direction
                       animated:(BOOL)animated{
    if (_nativePageViewController == nil) {
        [self enableSwipe];
        return;
    }
  
    transitioning = YES;

    __weak RNCPagerViewComponentView *weakSelf = self;
    [_nativePageViewController setViewControllers:@[[_nativeChildrenViewControllers objectAtIndex:index]]
                                        direction:direction
                                         animated:animated
                                       completion:^(BOOL finished) {
        self->transitioning = NO;
        __strong RNCPagerViewComponentView *strongSelf = weakSelf;
        [strongSelf enableSwipe];
        if (strongSelf->_eventEmitter != nullptr ) {
            const auto eventEmitter = [strongSelf pagerEventEmitter];
            int position = (int) index;
            eventEmitter->onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{.position =  static_cast<double>(position)});
            strongSelf->_currentIndex = index;
        }
        [strongSelf updateLayoutMetrics:strongSelf->_layoutMetrics oldLayoutMetrics:strongSelf->_oldLayoutMetrics];
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
    const auto eventEmitter = [self pagerEventEmitter];
    eventEmitter->onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Dragging });
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    
    const auto eventEmitter = [self pagerEventEmitter];
    eventEmitter->onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Settling });
    
    if (!_overdrag) {
        NSInteger maxIndex = _nativeChildrenViewControllers.count - 1;
        BOOL isFirstPage = [self isLtrLayout] ? _currentIndex == 0 : _currentIndex == maxIndex;
        BOOL isLastPage = [self isLtrLayout] ? _currentIndex == maxIndex : _currentIndex == 0;
        CGFloat contentOffset = [self isHorizontal] ? scrollView.contentOffset.x : scrollView.contentOffset.y;
        CGFloat topBound = [self isHorizontal] ? scrollView.bounds.size.width : scrollView.bounds.size.height;
        
        if ((isFirstPage && contentOffset <= topBound) || (isLastPage && contentOffset >= topBound)) {
            CGPoint croppedOffset = [self isHorizontal] ? CGPointMake(topBound, 0) : CGPointMake(0, topBound);
            *targetContentOffset = croppedOffset;
            
            eventEmitter->onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Idle });
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    const auto eventEmitter = [self pagerEventEmitter];
    eventEmitter->onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Idle });
}


- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    BOOL isHorizontal = [self isHorizontal];
    CGFloat contentOffset = isHorizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y;
    CGFloat frameSize = isHorizontal ? scrollView.frame.size.width : scrollView.frame.size.height;
    
    if (frameSize == 0) {
        return;
    }

    float offset = (contentOffset - frameSize) / frameSize;
    float absoluteOffset = fabs(offset);
    NSInteger position = _currentIndex;
    
    BOOL isHorizontalRtl = [self isHorizontalRtlLayout];
    BOOL isAnimatingBackwards = isHorizontalRtl ? offset > 0.05f : offset < 0;
    BOOL isBeingMovedByNestedScrollView = !scrollView.isDragging && !scrollView.isTracking;
    if (scrollView.isDragging || isBeingMovedByNestedScrollView) {
        _destinationIndex = isAnimatingBackwards ? _currentIndex - 1 : _currentIndex + 1;
    }
    
    if (isAnimatingBackwards) {
        position = _destinationIndex;
        absoluteOffset = fmax(0, 1 - absoluteOffset);
    }
    
    if (!_overdrag) {
        NSInteger maxIndex = _nativeChildrenViewControllers.count - 1;
        NSInteger firstPageIndex = isHorizontalRtl ? maxIndex : 0;
        NSInteger lastPageIndex = isHorizontalRtl ? 0 : maxIndex;
        BOOL isFirstPage = _currentIndex == firstPageIndex;
        BOOL isLastPage = _currentIndex == lastPageIndex;
        CGFloat topBound = isHorizontal ? scrollView.bounds.size.width : scrollView.bounds.size.height;
        
        if ((isFirstPage && contentOffset <= topBound) || (isLastPage && contentOffset >= topBound)) {
            CGPoint croppedOffset = isHorizontal ? CGPointMake(topBound, 0) : CGPointMake(0, topBound);
            scrollView.contentOffset = croppedOffset;
            absoluteOffset = 0;
            position = isLastPage ? lastPageIndex : firstPageIndex;
        }
    }
    
    float interpolatedOffset = absoluteOffset * labs(_destinationIndex - _currentIndex);
    [self sendScrollEventsForPosition:position offset:interpolatedOffset];
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
        const auto eventEmitter = [self pagerEventEmitter];
        eventEmitter->onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{.position =  static_cast<double>(position)});
    }
}

#pragma mark - UIPageViewControllerDataSource

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
    
    UIPageViewControllerNavigationDirection direction = [self isLtrLayout] ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
    return [self nextControllerForController:viewController inDirection:direction];
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
    UIPageViewControllerNavigationDirection direction = [self isLtrLayout] ? UIPageViewControllerNavigationDirectionReverse : UIPageViewControllerNavigationDirectionForward;
    return [self nextControllerForController:viewController inDirection:direction];
}

#pragma mark - Imperative methods exposed to React Native

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args {
   RCTRNCViewPagerHandleCommand(self, commandName, args);
}

- (void)setPage:(NSInteger)index {
    [self goTo:index animated:YES];
}

- (void)setPageWithoutAnimation:(NSInteger)index {
    [self goTo:index animated:NO];
}

- (void)setScrollEnabledImperatively:(BOOL)scrollEnabled {
    _scrollEnabled = scrollEnabled;
    [self applyScrollEnabled];
}

#pragma mark - Helpers

- (BOOL)isHorizontalRtlLayout {
    return self.isHorizontal && !self.isLtrLayout;
}

- (BOOL)isHorizontal {
    return _nativePageViewController.navigationOrientation == UIPageViewControllerNavigationOrientationHorizontal;
}

- (BOOL)isLtrLayout {
    return [_layoutDirection isEqualToString: @"ltr"];
}

- (std::shared_ptr<const RNCViewPagerEventEmitter>)pagerEventEmitter
{
  if (!_eventEmitter) {
    return nullptr;
  }

  assert(std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter));
  return std::static_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
}

- (void)sendScrollEventsForPosition:(NSInteger)position offset:(CGFloat)offset {
    const auto eventEmitter = [self pagerEventEmitter];
    eventEmitter->onPageScroll(RNCViewPagerEventEmitter::OnPageScroll{
        .position = static_cast<double>(position),
        .offset = offset
    });
  
    // This is temporary workaround to allow animations based on onPageScroll event
    // until Fabric implements proper NativeAnimationDriver,
    // see: https://github.com/facebook/react-native/blob/44f431b471c243c92284aa042d3807ba4d04af65/packages/react-native/React/Fabric/Mounting/ComponentViews/ScrollView/RCTScrollViewComponentView.mm#L59
    RCTOnPageScrollEvent *event = [[RCTOnPageScrollEvent alloc] initWithReactTag:@(self.tag)
                                                                        position:@(position)
                                                                          offset:@(offset)];
    NSDictionary *userInfo = @{@"event": event};
    [[NSNotificationCenter defaultCenter] postNotificationName:@"RCTNotifyEventDispatcherObserversOfEvent_DEPRECATED"
                                                        object:nil
                                                      userInfo:userInfo];
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
