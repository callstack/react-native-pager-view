#import <React/RCTEventDispatcher.h>
#import <React/RCTShadowView.h>
#import <React/UIView+React.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface ReactNativePageView: UIView

- (instancetype)init;

@property(nonatomic) NSInteger count;
@property(nonatomic) NSInteger offset;
@property(nonatomic) UIPageViewControllerNavigationOrientation orientation;
@property(nonatomic) BOOL overdrag;
@property(nonatomic) NSInteger pageMargin;
@property(nonatomic) BOOL scrollEnabled;
@property(nonatomic) BOOL showPageIndicator;
@property(nonatomic) UIPageViewControllerTransitionStyle transitionStyle;

@property(nonatomic, copy) RCTDirectEventBlock onPageSelected;
@property(nonatomic, copy) RCTDirectEventBlock onPageScroll;
@property(nonatomic, copy) RCTDirectEventBlock onPageScrollStateChanged;

- (void)goTo:(NSInteger)index animated:(BOOL)animated;
- (void)shouldScroll:(BOOL)scrollEnabled;

@end

NS_ASSUME_NONNULL_END
