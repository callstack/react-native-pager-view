#import "ReactPageViewController.h"
#import <React/RCTShadowView.h>
#import <React/UIView+React.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface ReactNativePageView: UIView <UIPageViewControllerDataSource, UIPageViewControllerDelegate,UIScrollViewDelegate>

@property(strong, nonatomic, readonly) ReactPageViewController *reactPageViewController;
@property(strong, nonatomic, readonly) UIPageControl *reactPageIndicatorView;

@property(nonatomic, strong) NSMutableArray<UIViewController *> *childrenViewControllers;
@property(nonatomic) NSInteger initialPage;
@property(nonatomic) NSInteger currentIndex;
@property(nonatomic) NSInteger pageMargin;
@property(nonatomic, readonly) BOOL scrollEnabled;
@property(nonatomic, readonly) BOOL showPageIndicator;
@property(nonatomic, readonly) UIScrollViewKeyboardDismissMode dismissKeyboard;
@property(nonatomic) UIPageViewControllerTransitionStyle transitionStyle;
@property(nonatomic) UIPageViewControllerNavigationOrientation orientation;
@property(nonatomic, copy) RCTBubblingEventBlock onPageSelected;
@property(nonatomic, copy) RCTBubblingEventBlock onPageScroll;
@property(nonatomic, copy) RCTBubblingEventBlock onPageScrollStateChanged;


- (void)goTo:(NSNumber *)index animated:(BOOL)animated;
- (void)shouldScroll:(BOOL)scrollEnabled;
- (void)shouldShowPageIndicator:(BOOL)showPageIndicator;
- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard;

@end

NS_ASSUME_NONNULL_END
