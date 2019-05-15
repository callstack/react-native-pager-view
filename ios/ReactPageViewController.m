
#import "ReactPageViewController.h"

@interface ReactPageViewController ()

@end

@implementation ReactPageViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self setViewControllers:[NSArray arrayWithObjects: [self viewControllerAtIndex:0], nil] direction:UIPageViewControllerNavigationDirectionForward animated:NO completion:nil];
    self.view.backgroundColor = UIColor.blueColor;

}

- (UIViewController *)viewControllerAtIndex:(NSUInteger)index {
    UIViewController *childViewController = [[UIViewController alloc] init];
    childViewController.view.tag = 9999 + index;
    childViewController.view.backgroundColor = [UIColor colorWithRed:index/100 green:0.5 blue:0.5 alpha:1];
    return childViewController;
    
}

@end
