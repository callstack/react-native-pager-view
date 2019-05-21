
#import <UIKit/UIKit.h>
#import "ReactPageViewController.h"
#import <React/RCTShadowView.h>
#import <React/UIView+React.h>

NS_ASSUME_NONNULL_BEGIN

@interface ReactNativePageView : UIView<UIPageViewControllerDataSource, UIPageViewControllerDelegate>
@property (strong, nonatomic, readonly) ReactPageViewController *reactPageViewController;

@property (nonatomic, strong) NSMutableArray<UIViewController *> *childrenViewControllers;
@property (nonatomic) NSInteger initialPage;
@property (nonatomic) NSInteger currentIndex;
@property (nonatomic) NSInteger pageMargin;
@property (nonatomic, readonly) BOOL scrollEnabled;
@property (nonatomic) UIPageViewControllerTransitionStyle transitionStyle;
@property (nonatomic) UIPageViewControllerNavigationOrientation orientation;
@property (nonatomic, copy) RCTBubblingEventBlock onPageSelected;

- (void) goTo:(NSNumber*) index animated:(BOOL) animated;
- (void) shouldScroll:(BOOL) scrollEnabled;
@end

NS_ASSUME_NONNULL_END
