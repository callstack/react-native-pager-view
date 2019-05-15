
#import <UIKit/UIKit.h>
#import "ReactPageViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface ReactNativePageView : UIView
@property (strong, nonatomic, readonly) ReactPageViewController *reactPageViewController;
@property (nullable, nonatomic, weak) id <UIPageViewControllerDelegate> delegate;
@property (nullable, nonatomic, weak) id <UIPageViewControllerDataSource> dataSource;

- (instancetype)initWithProtocols: (id <UIPageViewControllerDelegate>) delegate and:(id <UIPageViewControllerDataSource>) dataSource;
- (void)embed;
@end

NS_ASSUME_NONNULL_END
