#import "RNCPagerViewComponentView.h"
#import <react/renderer/components/pagerview/ComponentDescriptors.h>
#import <react/renderer/components/pagerview/EventEmitters.h>
#import <react/renderer/components/pagerview/Props.h>
#import <react/renderer/components/pagerview/RCTComponentViewHelpers.h>

#import <React/RCTConstants.h>
#import <React/RCTFabricComponentsPlugins.h>

#import "RCTOnPageScrollEvent.h"
#import "RNCPagerViewProviding.h"

using namespace facebook::react;

// Once Fabric implements proper NativeAnimationDriver, this should be removed.
// This is just a workaround to allow animations based on onPageScroll event,
// as RCTScrollViewComponentView does for onScroll,
// see: https://github.com/facebook/react-native/blob/44f431b471c243c92284aa042d3807ba4d04af65/packages/react-native/React/Fabric/Mounting/ComponentViews/ScrollView/RCTScrollViewComponentView.mm#L59
static void
RCTSendPageScrollEventForNativeAnimations_DEPRECATED(NSInteger tag, NSInteger position, double offset)
{
  RCTOnPageScrollEvent *event = [[RCTOnPageScrollEvent alloc] initWithReactTag:@(tag)
                                                                      position:@(position)
                                                                        offset:@(offset)];
  [[NSNotificationCenter defaultCenter] postNotificationName:RCTNotifyEventDispatcherObserversOfEvent_DEPRECATED
                                                      object:nil
                                                    userInfo:@{@"event": event}];
}

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol, PagerViewProviderDelegate>
@end

@implementation RNCPagerViewComponentView {
  UIView<RNCPagerViewProviding> *_pagerViewProvider;
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
    _pagerViewProvider = RNCPagerViewCreateProvider(self);
    self.contentView = _pagerViewProvider;
  }

  return self;
}

#pragma mark - React API

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  [_pagerViewProvider insertChild:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  [_pagerViewProvider removeChildAtIndex:index];
  [childComponentView removeFromSuperview];
}

+ (BOOL)shouldBeRecycled
{
  return NO;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldPagerProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
  const auto &newPagerProps = *std::static_pointer_cast<const RNCViewPagerProps>(props);

  if (_pagerViewProvider.currentPage == -1) {
    _pagerViewProvider.currentPage = newPagerProps.initialPage;
  }

  if (oldPagerProps.scrollEnabled != newPagerProps.scrollEnabled) {
    _pagerViewProvider.scrollEnabled = newPagerProps.scrollEnabled;
  }

  if (oldPagerProps.overdrag != newPagerProps.overdrag) {
    _pagerViewProvider.overdrag = newPagerProps.overdrag;
  }

  if (oldPagerProps.keyboardDismissMode != newPagerProps.keyboardDismissMode) {
    _pagerViewProvider.keyboardDismissMode = newPagerProps.keyboardDismissMode == RNCViewPagerKeyboardDismissMode::OnDrag
        ? UIScrollViewKeyboardDismissModeOnDrag
        : UIScrollViewKeyboardDismissModeNone;
  }

  if (oldPagerProps.orientation != newPagerProps.orientation) {
    _pagerViewProvider.orientation = newPagerProps.orientation == RNCViewPagerOrientation::Vertical
        ? UICollectionViewScrollDirectionVertical
        : UICollectionViewScrollDirectionHorizontal;
  }

  if (oldPagerProps.layoutDirection != newPagerProps.layoutDirection) {
    _pagerViewProvider.layoutDirection = newPagerProps.layoutDirection == RNCViewPagerLayoutDirection::Rtl
        ? PagerLayoutDirectionRtl
        : PagerLayoutDirectionLtr;
  }

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - PagerViewProviderDelegate

- (void)onPageScrollWithPosition:(NSInteger)position offset:(double)offset {
  const auto eventEmitter = [self pagerEventEmitter];
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onPageScroll(RNCViewPagerEventEmitter::OnPageScroll{
    .position = static_cast<double>(position),
    .offset = offset
  });

  RCTSendPageScrollEventForNativeAnimations_DEPRECATED(self.tag, position, offset);
}

- (void)onPageSelectedWithPosition:(NSInteger)position {
  const auto eventEmitter = [self pagerEventEmitter];
  if (!eventEmitter) {
    return;
  }
  eventEmitter->onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{.position = static_cast<double>(position)});
}

- (void)onPageScrollStateChangedWithState:(PageScrollState)state {
  const auto eventEmitter = [self pagerEventEmitter];
  if (!eventEmitter) {
    return;
  }

  RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState scrollState;

  switch (state) {
    case PageScrollStateIdle:
      scrollState = RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Idle;
      break;

    case PageScrollStateDragging:
      scrollState = RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Dragging;
      break;

    case PageScrollStateSettling:
      scrollState = RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Settling;
      break;
  }

  eventEmitter->onPageScrollStateChanged(RNCViewPagerEventEmitter::OnPageScrollStateChanged{
    .pageScrollState = scrollState
  });
}

#pragma mark - Imperative methods exposed to React Native

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args {
  RCTRNCViewPagerHandleCommand(self, commandName, args);
}

- (void)setPage:(NSInteger)index animation:(NSString *)animation {
  [_pagerViewProvider goToIndex:index
                      animation:[animation isEqualToString:@"direct"] ? PagerPageAnimationDirect : PagerPageAnimationScroll];
}

- (void)setPageWithoutAnimation:(NSInteger)index {
  [_pagerViewProvider goToIndex:index animation:PagerPageAnimationNone];
}

- (void)setScrollEnabledImperatively:(BOOL)scrollEnabled {
  _pagerViewProvider.scrollEnabled = scrollEnabled;
}

#pragma mark - Internal methods

- (std::shared_ptr<const RNCViewPagerEventEmitter>)pagerEventEmitter
{
  if (!_eventEmitter) {
    return nullptr;
  }

  assert(std::dynamic_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter));
  return std::static_pointer_cast<const RNCViewPagerEventEmitter>(_eventEmitter);
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
