
#import "ReactViewPagerManager.h"

@implementation ReactViewPagerManager

#pragma mark - RTC

RCT_EXPORT_MODULE(RNCViewPager)

RCT_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(pageMargin, NSInteger)

RCT_EXPORT_VIEW_PROPERTY(transitionStyle, UIPageViewControllerTransitionStyle)
RCT_EXPORT_VIEW_PROPERTY(orientation, UIPageViewControllerNavigationOrientation)
RCT_EXPORT_VIEW_PROPERTY(onPageSelected, RCTBubblingEventBlock)


RCT_EXPORT_METHOD(goToPage:(nonnull NSNumber*) index animated:(BOOL) animated) {
    [_reactNativePageView goToPage:index animated:animated];
}

RCT_CUSTOM_VIEW_PROPERTY(scrollEnabled, BOOL, ReactNativePageView){
    [view shouldScroll:[RCTConvert BOOL:json]];
}

- (UIView *)view {
    if(_reactNativePageView){
        return _reactNativePageView;
    }
    _reactNativePageView = [[ReactNativePageView alloc] init];
    _reactNativePageView.dataSource = self;
    _reactNativePageView.delegate = self;
    return _reactNativePageView;
}

#pragma mark - Delegate

- (void)pageViewController:(UIPageViewController *)pageViewController willTransitionToViewControllers:(NSArray<UIViewController *> *)pendingViewControllers {
    if (pendingViewControllers.count == 1){
        NSMutableArray<UIViewController *> *childrenViewControllers = [_reactNativePageView childrenViewControllers];
        NSUInteger index = [childrenViewControllers indexOfObject: [pendingViewControllers objectAtIndex:0]];
        _reactNativePageView.onPageSelected(@{@"position": [NSNumber numberWithLong:index]});
    } else{
        RCTLog(@"Only one screen support");
    }
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
    
    if (index == NSNotFound) {
        return nil;
    }
    
    if (index == 0) {
        return nil;
    }
    
    index--;
    return [childrenViewControllers objectAtIndex:index];
    
}

- (NSInteger)presentationCountForPageViewController:(UIPageViewController *)pageViewController {
    return [[_reactNativePageView childrenViewControllers] count];
}

- (NSInteger)presentationIndexForPageViewController:(UIPageViewController *)pageViewController {
   return _reactNativePageView.currentIndex;
}

@end
