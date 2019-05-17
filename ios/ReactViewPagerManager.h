
#import <UIKit/UIKit.h>
#import <React/RCTViewManager.h>
#import <React/RCTLog.h>
#import "ReactPageViewController.h"
#import "ReactNativePageView.h"
NS_ASSUME_NONNULL_BEGIN

@interface ReactViewPagerManager : RCTViewManager<UIPageViewControllerDataSource, UIPageViewControllerDelegate>
@property (strong, nonatomic) ReactNativePageView *reactNativePageView;
@end

NS_ASSUME_NONNULL_END
