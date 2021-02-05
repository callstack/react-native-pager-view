#import <React/RCTEventDispatcher.h>
#import <React/RCTShadowView.h>
#import <React/UIView+React.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface ReactNativePageView: UIView

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher;

@property(nonatomic) NSInteger count;
@property(nonatomic) NSInteger offset;
@property(nonatomic) UIPageViewControllerTransitionStyle transitionStyle;
@property(nonatomic) UIPageViewControllerNavigationOrientation orientation;
@property(nonatomic, copy) RCTDirectEventBlock onPageSelected;
@property(nonatomic, copy) RCTDirectEventBlock onPageScroll;

- (void)goTo:(NSInteger)index animated:(BOOL)animated;

@end

NS_ASSUME_NONNULL_END
