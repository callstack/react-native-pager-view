#import <Foundation/Foundation.h>
#import "RNCPagerViewComponentView.h"
#import <react/renderer/components/pagerview/ComponentDescriptors.h>
#import <react/renderer/components/pagerview/EventEmitters.h>
#import <react/renderer/components/pagerview/Props.h>
#import <react/renderer/components/pagerview/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "React/RCTConversions.h"

#import "RCTOnPageScrollEvent.h"

#if __has_include("react_native_pager_view/react_native_pager_view-Swift.h")
#import "react_native_pager_view/react_native_pager_view-Swift.h"
#else
#import "react_native_pager_view-Swift.h"
#endif

using namespace facebook::react;

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol, PagerViewProviderDelegate>
@end

@implementation RNCPagerViewComponentView {
  PagerViewProvider *_pagerViewProvider;
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
    _pagerViewProvider = [[PagerViewProvider alloc] initWithDelegate:self];
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

- (void)updateProps:(const facebook::react::Props::Shared &)props oldProps:(const facebook::react::Props::Shared &)oldProps{
  const auto &oldScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(_props);
  const auto &newScreenProps = *std::static_pointer_cast<const RNCViewPagerProps>(props);

  if (_pagerViewProvider.currentPage == -1) {
     _pagerViewProvider.currentPage = newScreenProps.initialPage;
   }

  if (oldScreenProps.scrollEnabled != newScreenProps.scrollEnabled) {
     _pagerViewProvider.scrollEnabled = newScreenProps.scrollEnabled;
   }

  if (oldScreenProps.overdrag != newScreenProps.overdrag) {
     _pagerViewProvider.overdrag = newScreenProps.overdrag;
   }

  if (oldScreenProps.keyboardDismissMode != newScreenProps.keyboardDismissMode) {
    switch (newScreenProps.keyboardDismissMode) {
      case RNCViewPagerKeyboardDismissMode::None:
        _pagerViewProvider.keyboardDismissMode = UIScrollViewKeyboardDismissModeNone;
        break;

      case RNCViewPagerKeyboardDismissMode::OnDrag:
        _pagerViewProvider.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag;
    }
   }

  if (oldScreenProps.orientation != newScreenProps.orientation) {
    _pagerViewProvider.orientation = newScreenProps.orientation == RNCViewPagerOrientation::Vertical ? UICollectionViewScrollDirectionVertical : UICollectionViewScrollDirectionHorizontal;
  }

  if (oldScreenProps.layoutDirection != newScreenProps.layoutDirection) {
    _pagerViewProvider.layoutDirection = newScreenProps.layoutDirection == RNCViewPagerLayoutDirection::Rtl ? PagerLayoutDirectionRtl : PagerLayoutDirectionLtr;
  }

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - PagerViewProviderDelegate

- (void)onPageScrollWithData:(OnPageScrollEventData *)data {
  const auto eventEmitter = [self pagerEventEmitter];
  [self sendScrollEventsForPosition:data.position offset:data.offset];
}

- (void)onPageSelectedWithPosition:(NSInteger)position {
  const auto eventEmitter = [self pagerEventEmitter];
  eventEmitter->onPageSelected(RNCViewPagerEventEmitter::OnPageSelected{.position =  static_cast<double>(position)});
}

- (void)onPageScrollStateChangedWithState:(enum PageScrollState)state {
  const auto eventEmitter = [self pagerEventEmitter];

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

#pragma mark - Internal methods

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
  [_pagerViewProvider goToIndex:index animated:animated];
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
  _pagerViewProvider.scrollEnabled = scrollEnabled;
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
