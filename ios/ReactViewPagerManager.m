
#import "ReactViewPagerManager.h"

@interface ReactViewPagerManager ()

@end

@implementation ReactViewPagerManager

#pragma mark - RTC

RCT_EXPORT_MODULE(RNCViewPager)

RCT_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(pageMargin, NSInteger)

RCT_ENUM_CONVERTER(UIPageViewControllerTransitionStyle, (@{
                                                  @"scroll": @(UIPageViewControllerTransitionStyleScroll),
                                                  @"curl": @(UIPageViewControllerTransitionStylePageCurl),
                                                  }), UIPageViewControllerTransitionStyleScroll, integerValue)

RCT_ENUM_CONVERTER(UIPageViewControllerNavigationOrientation, (@{
                                                           @"horizontal": @(UIPageViewControllerNavigationOrientationHorizontal),
                                                           @"vertical": @(UIPageViewControllerNavigationOrientationVertical),
                                                           }), UIPageViewControllerNavigationOrientationHorizontal, integerValue)

RCT_CUSTOM_VIEW_PROPERTY(transitionStyle, UIPageViewControllerTransitionStyle, ReactNativePageView){
    NSString *type = [RCTConvert NSString:json];
    if([type isEqualToString:@"scroll"]){
        view.transitionStyle = UIPageViewControllerTransitionStyleScroll;
    }
    
    if([type isEqualToString:@"curl"]){
     view.transitionStyle = UIPageViewControllerTransitionStylePageCurl;
    }
}

RCT_CUSTOM_VIEW_PROPERTY(orientation, UIPageViewControllerNavigationOrientation, ReactNativePageView){
    NSString *type = [RCTConvert NSString:json];
    if([type isEqualToString:@"horizontal"]){
        view.orientation = UIPageViewControllerNavigationOrientationHorizontal;
    }
    
    if([type isEqualToString:@"vertical"]){
        view.orientation = UIPageViewControllerNavigationOrientationVertical;
    }
}


RCT_CUSTOM_VIEW_PROPERTY(scrollEnabled, BOOL, ReactNativePageView){
    view.scrollEnabled = [RCTConvert BOOL:json];
}

- (UIView *)view {
    if(_reactNativePageView){
        return _reactNativePageView;
    }
    _reactNativePageView = [[ReactNativePageView alloc] init];
    _reactNativePageView.dataSource = self;
    return _reactNativePageView;
}



#pragma mark - Datasource After

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerAfterViewController:(UIViewController *)viewController {
        
    NSMutableArray<UIViewController *> *childrenViewControllers = [_reactNativePageView childrenViewControllers];
    NSUInteger index = [childrenViewControllers indexOfObject:viewController];
    
    if (index == NSNotFound) {
        return nil;
    }
    
    index++;
    if (index == [childrenViewControllers count]) {
        return nil;
    }

    return [childrenViewControllers objectAtIndex:index];
    
}

#pragma mark - Datasource Before

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerBeforeViewController:(UIViewController *)viewController {
    
    NSMutableArray<UIViewController *> *childrenViewControllers = [_reactNativePageView childrenViewControllers];
    NSUInteger index = [childrenViewControllers indexOfObject:viewController];
    
    if ((index == 0) || (index == NSNotFound)) {
        return nil;
    }
    
    index--;
    
    return [childrenViewControllers objectAtIndex:index];
    
}

- (NSInteger)presentationCountForPageViewController:(UIPageViewController *)pageViewController {
    return [[_reactNativePageView childrenViewControllers] count];
}

- (NSInteger)presentationIndexForPageViewController:(UIPageViewController *)pageViewController {
   return ((ReactNativePageView *)[self view]).initialPage;
}

@end
