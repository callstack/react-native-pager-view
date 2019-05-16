
#import <UIKit/UIKit.h>
#import "ReactPageViewController.h"
#import <React/RCTShadowView.h>
#import <React/UIView+React.h>

NS_ASSUME_NONNULL_BEGIN

@interface ReactNativePageView : UIView
@property (strong, nonatomic, readonly) ReactPageViewController *reactPageViewController;
@property (nullable, nonatomic, weak) id <UIPageViewControllerDelegate> delegate;
@property (nullable, nonatomic, weak) id <UIPageViewControllerDataSource> dataSource;

@property (nonatomic, strong) NSMutableArray<UIViewController *> *childrenViewControllers;
@property (nonatomic) NSInteger initialPage;
@property (nonatomic) NSInteger pageMargin;
@property (nonatomic) BOOL scrollEnabled;
- (void)embed;

@end

NS_ASSUME_NONNULL_END
