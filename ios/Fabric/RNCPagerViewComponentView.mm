#ifdef RCT_NEW_ARCH_ENABLED

#import <Foundation/Foundation.h>
#import "RNCPagerViewComponentView.h"
#import <RNCViewPager/RNCViewPagerComponentDescriptor.h>
#import <react/renderer/components/RNCViewPager/EventEmitters.h>
#import <react/renderer/components/RNCViewPager/Props.h>
#import <react/renderer/components/RNCViewPager/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "React/RCTConversions.h"

#import <React/RCTBridge+Private.h>
#import "RCTOnPageScrollEvent.h"

using namespace facebook::react;

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol, UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate, UIGestureRecognizerDelegate>

@property(nonatomic, assign) UIPanGestureRecognizer* panGestureRecognizer;

@end

@implementation RNCPagerViewComponentView {
    RNCViewPagerShadowNode::ConcreteState::Shared _state;
    UIScrollView *_scrollView;
    UIView *_containerView;

    CGSize _contentSize;
    NSInteger _initialPage;
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
        UIPanGestureRecognizer* panGestureRecognizer = [UIPanGestureRecognizer new];
        self.panGestureRecognizer = panGestureRecognizer;
        panGestureRecognizer.delegate = self;
        [self addGestureRecognizer: panGestureRecognizer];

    }
    
    return self;
}

#pragma mark - React API

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
    UIViewController *wrapper = [[UIViewController alloc] initWithView:childComponentView];
    [_nativeChildrenViewControllers insertObject:wrapper atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
    [[_nativeChildrenViewControllers objectAtIndex:index].view removeFromSuperview];
    [_nativeChildrenViewControllers objectAtIndex:index].view = nil;
    [_nativeChildrenViewControllers removeObjectAtIndex:index];
 
    NSInteger maxPage = _nativeChildrenViewControllers.count - 1;
    
    if (self.currentIndex >= maxPage) {
        [self goTo:maxPage animated:NO];
    }
}


-(void)updateLayoutMetrics:(const facebook::react::LayoutMetrics &)layoutMetrics oldLayoutMetrics:(const facebook::react::LayoutMetrics &)oldLayoutMetrics {
    [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:_layoutMetrics];
    self.contentView.frame = RCTCGRectFromRect(_layoutMetrics.getContentFrame());
    _layoutMetrics = layoutMetrics;
}


-(void)prepareForRecycle {
    [super prepareForRecycle];
    
    _nativeChildrenViewControllers = [[NSMutableArray alloc] init];
    [_nativePageViewController.view removeFromSuperview];
    _nativePageViewController = nil;
    
    _currentIndex = -1;
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


- (void)updateProps:(const facebook::react::Props::Shared &)props oldProps:(const facebook::react::Props::Shared &)oldProps{
    const auto &oldScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
    const auto &newScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(props);
    
    if (_scrollView.bounces != newScreenProps.overdrag) {
        [_scrollView setBounces: newScreenProps.overdrag];
    }
    
    if (_scrollView.scrollEnabled != newScreenProps.scrollEnabled) {
        [_scrollView setScrollEnabled:newScreenProps.scrollEnabled];
    }
    
    
    [super updateProps:props oldProps:oldProps];
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
    [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
    if (layoutMetrics.layoutDirection != oldLayoutMetrics.layoutDirection) {
        CGAffineTransform transform = (layoutMetrics.layoutDirection == LayoutDirection::LeftToRight)
        ? CGAffineTransformIdentity
        : CGAffineTransformMakeScale(-1, 1);
        
        _containerView.transform = transform;
        _scrollView.transform = transform;
    }
}

- (void)updateState:(State::Shared const &)state oldState:(State::Shared const &)oldState
{
    assert(std::dynamic_pointer_cast<RNCViewPagerShadowNode::ConcreteState const>(state));
    _state = std::static_pointer_cast<RNCViewPagerShadowNode::ConcreteState const>(state);
    
    const auto &props = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
    
    auto &data = _state->getData();
    
    auto contentOffset = RCTCGPointFromPoint(data.contentOffset);
    if (!oldState && !CGPointEqualToPoint(contentOffset, CGPointZero)) {
        _scrollView.contentOffset = contentOffset;
    }
    
    CGSize contentSize = RCTCGSizeFromSize(data.getContentSize());
    
    if (CGSizeEqualToSize(_contentSize, contentSize)) {
        return;
    }
    
    _contentSize = contentSize;
    _containerView.frame = CGRect{RCTCGPointFromPoint(data.contentBoundingRect.origin), contentSize};
    
    _scrollView.contentSize = contentSize;
    
    if (!CGSizeEqualToSize(_scrollView.frame.size, CGSizeZero) && _initialPage == -1) {
        [self setPageWithoutAnimation: props.initialPage];
        _initialPage = props.initialPage;
    }
    
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [_containerView insertSubview:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [childComponentView removeFromSuperview];
    
    NSInteger numberOfPages = _containerView.subviews.count;

    if ([self getCurrentPage] >= numberOfPages - 1) {
        [self setPageWithoutAnimation: numberOfPages - 1];
    }
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args {
    RCTRNCViewPagerHandleCommand(self, commandName, args);
}

- (void)prepareForRecycle
{
    _state.reset();
    [_scrollView setContentOffset:CGPointZero];
    
    _initialPage = -1;
    
    [super prepareForRecycle];
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    strongEventEmitter.onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Dragging });
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    strongEventEmitter.onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Settling });
    
    if (!_overdrag) {
        NSInteger maxIndex = _nativeChildrenViewControllers.count - 1;
        BOOL isFirstPage = [self isLtrLayout] ? _currentIndex == 0 : _currentIndex == maxIndex;
        BOOL isLastPage = [self isLtrLayout] ? _currentIndex == maxIndex : _currentIndex == 0;
        CGFloat contentOffset = [self isHorizontal] ? scrollView.contentOffset.x : scrollView.contentOffset.y;
        CGFloat topBound = [self isHorizontal] ? scrollView.bounds.size.width : scrollView.bounds.size.height;
        
        if ((isFirstPage && contentOffset <= topBound) || (isLastPage && contentOffset >= topBound)) {
            CGPoint croppedOffset = [self isHorizontal] ? CGPointMake(topBound, 0) : CGPointMake(0, topBound);
            *targetContentOffset = croppedOffset;
            
            strongEventEmitter.onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Idle });
        }
    }
    
   
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    int position = [self getCurrentPage];
    
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    
    strongEventEmitter.onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{.pageScrollState =  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Idle });
    
    strongEventEmitter.onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{.position =  static_cast<double>(position)});
}

//Handles sending onPageSelected event on setPage method completion
-(void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    int position = [self getCurrentPage];
    
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    
    strongEventEmitter.onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{.position =  static_cast<double>(position)});
}

-(void)scrollViewDidScroll:(UIScrollView *)scrollView {
    int position = [self getCurrentPage];
    
    double offset = [self isHorizontal] ? (scrollView.contentOffset.x - (scrollView.frame.size.width * position))/scrollView.frame.size.width : (scrollView.contentOffset.y - (scrollView.frame.size.height * position))/scrollView.frame.size.height;
    
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    
    strongEventEmitter.onPageScroll(RNCViewPagerEventEmitter::OnPageScroll{.position =  static_cast<double>(position), .offset = offset});
    
    //This is temporary workaround to allow animations based on onPageScroll event
    //until Fabric implements proper NativeAnimationDriver
    RCTBridge *bridge = [RCTBridge currentBridge];
    
    if (bridge) {
        [bridge.eventDispatcher sendEvent:[[RCTOnPageScrollEvent alloc] initWithReactTag:[NSNumber numberWithInt:self.tag] position:@(position) offset:@(offset)]];
    }
}

#pragma mark - Internal methods

-(bool)isHorizontal {
    return _scrollView.contentSize.width > _scrollView.contentSize.height;
}

-(int)getCurrentPage {
    return [self isHorizontal] ? _scrollView.contentOffset.x / _scrollView.frame.size.width : _scrollView.contentOffset.y / _scrollView.frame.size.height;
}

-(CGPoint)getPageOffset:(NSInteger)pageIndex {
    return [self isHorizontal] ? CGPointMake(_scrollView.frame.size.width * pageIndex, 0) : CGPointMake(0, _scrollView.frame.size.height * pageIndex);
}

- (void)setPage:(NSInteger)index {
    CGPoint targetOffset = [self getPageOffset:index];
    
    [_scrollView setContentOffset:targetOffset animated:YES];
}

- (void)setPageWithoutAnimation:(NSInteger)index {
    CGPoint targetOffset = [self getPageOffset:index];
    
    [_scrollView setContentOffset:targetOffset animated:NO];
    
    const auto strongEventEmitter = *std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
    
    strongEventEmitter.onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{.position =  static_cast<double>(index)});
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<RNCViewPagerComponentDescriptor>();
}


- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer {

    // Recognize simultaneously only if the other gesture is RN Screen's pan gesture (one that is used to perform fullScreenGestureEnabled)
    if (gestureRecognizer == self.panGestureRecognizer && [NSStringFromClass([otherGestureRecognizer class]) isEqual: @"RNSPanGestureRecognizer"]) {
        UIPanGestureRecognizer* panGestureRecognizer = (UIPanGestureRecognizer*) gestureRecognizer;
        CGPoint velocity = [panGestureRecognizer velocityInView:self];
        BOOL isLTR = [self isLtrLayout];
        BOOL isBackGesture = (isLTR && velocity.x > 0) || (!isLTR && velocity.x < 0);
        
        if (self.currentIndex == 0 && isBackGesture) {
            scrollView.panGestureRecognizer.enabled = false;
        } else {
            const auto &viewProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
            scrollView.panGestureRecognizer.enabled = viewProps.scrollEnabled;
        }
        
        return YES;
    }
    const auto &viewProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
    scrollView.panGestureRecognizer.enabled = viewProps.scrollEnabled;
    return NO;
}

@end

Class<RCTComponentViewProtocol> RNCViewPagerCls(void)
{
    return RNCPagerViewComponentView.class;
}

#endif
