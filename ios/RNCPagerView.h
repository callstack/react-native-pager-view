#import <React/RCTView.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTShadowView.h>
#import <UIKit/UIKit.h>
#import "UIView+isHorizontalRtlLayout.h"

NS_ASSUME_NONNULL_BEGIN

@interface RNCPagerView: RCTView <RtlLayoutProtocol>

- (instancetype)initWithBridge:(RCTBridge *)bridge;

@property(nonatomic) NSInteger initialPage;
@property(nonatomic) NSInteger lastReportedIndex;
@property(nonatomic) NSInteger destinationIndex;
@property(nonatomic) NSInteger currentIndex;
@property(nonatomic) NSInteger pageMargin;
@property(nonatomic, readonly) BOOL scrollEnabled;
#if !TARGET_OS_VISION
@property(nonatomic, readonly) UIScrollViewKeyboardDismissMode dismissKeyboard;
#endif
@property(nonatomic) UIPageViewControllerNavigationOrientation orientation;
@property(nonatomic, copy) RCTDirectEventBlock onPageSelected;
@property(nonatomic, copy) RCTDirectEventBlock onPageScroll;
@property(nonatomic, copy) RCTDirectEventBlock onPageScrollStateChanged;
@property(nonatomic) BOOL overdrag;
@property(nonatomic) NSString* layoutDirection;
@property(nonatomic, assign) BOOL transitioning;

- (void)goTo:(NSInteger)index animated:(BOOL)animated;
- (void)shouldScroll:(BOOL)scrollEnabled;
- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard;

@end

NS_ASSUME_NONNULL_END
