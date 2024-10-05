#ifdef RCT_NEW_ARCH_ENABLED

#import <Foundation/Foundation.h>
#import "RNCPagerViewComponentView.h"
#import <react/renderer/components/RNCViewPager/RNCViewPagerComponentDescriptor.h>
#import <react/renderer/components/pagerview/EventEmitters.h>
#import <react/renderer/components/pagerview/Props.h>
#import <react/renderer/components/pagerview/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "React/RCTConversions.h"

#import "RCTOnPageScrollEvent.h"

using namespace facebook::react;

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol, UIScrollViewDelegate>
@end

@implementation RNCPagerViewComponentView {
    RNCViewPagerShadowNode::ConcreteState::Shared _state;
    UIScrollView *_scrollView;
    UIView *_containerView;
    
    CGSize _contentSize;
    NSInteger _initialPage;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNCViewPagerProps>();
        _props = defaultProps;
        _initialPage = -1;
        
        _scrollView = [[UIScrollView alloc] initWithFrame:self.bounds];
        
        _scrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        _scrollView.delaysContentTouches = NO;
        _scrollView.delegate = self;
        _scrollView.pagingEnabled = YES;
        _scrollView.showsHorizontalScrollIndicator = NO;
        _scrollView.showsVerticalScrollIndicator = NO;
        
        [self addSubview:_scrollView];
        
        _containerView = [[UIView alloc] initWithFrame:CGRectZero];
        
        [_scrollView addSubview:_containerView];
    }
    
    return self;
}


#pragma mark - React API

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
    
    // This is temporary workaround to allow animations based on onPageScroll event
    // until Fabric implements proper NativeAnimationDriver,
    // see: https://github.com/facebook/react-native/blob/44f431b471c243c92284aa042d3807ba4d04af65/packages/react-native/React/Fabric/Mounting/ComponentViews/ScrollView/RCTScrollViewComponentView.mm#L59
    NSDictionary *userInfo = [NSDictionary dictionaryWithObjectsAndKeys:[[RCTOnPageScrollEvent alloc] initWithReactTag:[NSNumber numberWithInt:self.tag] position:@(position) offset:@(offset)], @"event", nil];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"RCTNotifyEventDispatcherObserversOfEvent_DEPRECATED"
                                                        object:nil
                                                      userInfo:userInfo];
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


@end

Class<RCTComponentViewProtocol> RNCViewPagerCls(void)
{
    return RNCPagerViewComponentView.class;
}

#endif
