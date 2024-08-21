#import <React/RCTEventDispatcher.h>
#import <React/RCTShadowView.h>
#import <React/UIView+React.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNCPagerView: UIView

- (instancetype)initWithEventDispatcher:(id<RCTEventDispatcherProtocol> )eventDispatcher;

@property(nonatomic) NSInteger initialPage;
@property(nonatomic) NSString* orientation;
#if !TARGET_OS_VISION
@property(nonatomic, readonly) UIScrollViewKeyboardDismissMode dismissKeyboard;
#endif
@property(nonatomic, copy) RCTDirectEventBlock onPageSelected;
@property(nonatomic, copy) RCTDirectEventBlock onPageScroll;
@property(nonatomic, copy) RCTDirectEventBlock onPageScrollStateChanged;
@property(nonatomic) BOOL overdrag;
@property(nonatomic, assign) BOOL animating;

- (void)goTo:(NSInteger)index animated:(BOOL)animated;
- (void)shouldScroll:(BOOL)scrollEnabled;
- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard;

@end

NS_ASSUME_NONNULL_END
