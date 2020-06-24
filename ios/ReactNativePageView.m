
#import "ReactNativePageView.h"
#import "React/RCTLog.h"
#import <React/RCTViewManager.h>
#import "UIViewController+CreateExtension.h"

@interface RCTOnPageScrollEvent : NSObject <RCTEvent>

- (instancetype) initWithReactTag:(NSNumber *)reactTag
                         position:(NSNumber *)position
                           offset:(NSNumber *)offset;

@end

@implementation RCTOnPageScrollEvent
{
    NSNumber* _position;
    NSNumber* _offset;
}

@synthesize viewTag = _viewTag;

- (NSString *)eventName {
    return @"onPageScroll";
}

- (instancetype) initWithReactTag:(NSNumber *)reactTag
                         position:(NSNumber *)position
                           offset:(NSNumber *)offset;
{
    RCTAssertParam(reactTag);
    
    if ((self = [super init])) {
        _viewTag = reactTag;
        _position = position;
        _offset = offset;
    }
    return self;
}

RCT_NOT_IMPLEMENTED(- (instancetype)init)
- (uint16_t)coalescingKey
{
    return 0;
}


- (BOOL)canCoalesce
{
    return YES;
}

+ (NSString *)moduleDotMethod
{
    return @"RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
    return @[self.viewTag, RCTNormalizeInputEventName(self.eventName), @{
                 @"position": _position,
                 @"offset": _offset
                 }];
}

- (id<RCTEvent>)coalesceWithEvent:(id<RCTEvent>)newEvent;
{
    return newEvent;
}

@end

@interface RCTOnPageScrollStateChanged : NSObject <RCTEvent>

- (instancetype) initWithReactTag:(NSNumber *)reactTag
                            state:(NSString *)state
                    coalescingKey:(uint16_t)coalescingKey;

@end

@implementation RCTOnPageScrollStateChanged
{
    NSString* _state;
    uint16_t _coalescingKey;
}

@synthesize viewTag = _viewTag;

- (NSString *)eventName {
    return @"onPageScrollStateChanged";
}

- (instancetype) initWithReactTag:(NSNumber *)reactTag
                            state:(NSString *)state
                    coalescingKey:(uint16_t)coalescingKey;
{
    RCTAssertParam(reactTag);
    
    if ((self = [super init])) {
        _viewTag = reactTag;
        _state = state;
        _coalescingKey = coalescingKey;
    }
    return self;
}

RCT_NOT_IMPLEMENTED(- (instancetype)init)
- (uint16_t)coalescingKey
{
    return _coalescingKey;
}


- (BOOL)canCoalesce
{
    return NO;
}

+ (NSString *)moduleDotMethod
{
    return @"RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
    return @[self.viewTag, RCTNormalizeInputEventName(self.eventName), @{
                 @"pageScrollState": _state,
                 }];
}

- (id<RCTEvent>)coalesceWithEvent:(id<RCTEvent>)newEvent;
{
    return newEvent;
}

@end


@interface RCTOnPageSelected : NSObject <RCTEvent>

- (instancetype) initWithReactTag:(NSNumber *)reactTag
                         position:(NSNumber *)position
                    coalescingKey:(uint16_t)coalescingKey;

@end

@implementation RCTOnPageSelected
{
    NSNumber* _position;
    uint16_t _coalescingKey;
}

@synthesize viewTag = _viewTag;

- (NSString *)eventName {
    return @"onPageSelected";
}

- (instancetype) initWithReactTag:(NSNumber *)reactTag
                         position:(NSNumber *)position
                    coalescingKey:(uint16_t)coalescingKey;
{
    RCTAssertParam(reactTag);
    
    if ((self = [super init])) {
        _viewTag = reactTag;
        _position = position;
        _coalescingKey = coalescingKey;
    }
    return self;
}

RCT_NOT_IMPLEMENTED(- (instancetype)init)
- (uint16_t)coalescingKey
{
    return _coalescingKey;
}


- (BOOL)canCoalesce
{
    return NO;
}

+ (NSString *)moduleDotMethod
{
    return @"RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
    return @[self.viewTag, RCTNormalizeInputEventName(self.eventName), @{
                 @"position": _position,
                 }];
}

- (id<RCTEvent>)coalesceWithEvent:(id<RCTEvent>)newEvent;
{
    return newEvent;
}

@end

@interface ReactNativePageView () <UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate>

@property(nonatomic, strong) UIPageViewController *reactPageViewController;
@property(nonatomic, strong) UIPageControl *reactPageIndicatorView;
@property(nonatomic, strong) RCTEventDispatcher *eventDispatcher;
@property(nonatomic, weak) UIScrollView *scrollView;

- (void)goTo:(NSInteger)index animated:(BOOL)animated;
- (void)shouldScroll:(BOOL)scrollEnabled;
- (void)shouldShowPageIndicator:(BOOL)showPageIndicator;
- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard;

@end

@implementation ReactNativePageView {
    uint16_t _coalescingKey;
}

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher {
    if (self = [super init]) {
        _scrollEnabled = YES;
        _pageMargin = 0;
        _transitionStyle = UIPageViewControllerTransitionStyleScroll;
        _orientation = UIPageViewControllerNavigationOrientationHorizontal;
        _currentIndex = 0;
        _dismissKeyboard = UIScrollViewKeyboardDismissModeNone;
        _coalescingKey = 0;
        _eventDispatcher = eventDispatcher;
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    if (self.reactPageViewController) {
        [self shouldScroll:self.scrollEnabled];
        //Below line fix bug, where the view does not update after orientation changed.
        [self goTo:self.currentIndex animated:NO];
    } else {
        [self embed];
    }
}

- (void)didUpdateReactSubviews {    
    if (self.reactSubviews.count == 0) {
        return;
    }
    [self addPages];
}

- (void)addPages {
    if ([self reactViewController]) {
        self.reactPageIndicatorView.numberOfPages = self.reactSubviews.count;
        [self goTo:self.currentIndex animated:NO];
    } else {
        RCTLog(@"getParentViewController returns nil");
    }
}

- (void)embed {
    if (![self reactViewController]) {
        RCTLog(@"getParentViewController returns nil");
        return;
    }
    
    NSDictionary *options = @{ UIPageViewControllerOptionInterPageSpacingKey: @(self.pageMargin) };
    UIPageViewController *pageViewController = [[UIPageViewController alloc] initWithTransitionStyle:self.transitionStyle
                                                                               navigationOrientation:self.orientation
                                                                                             options:options];
    pageViewController.delegate = self;
    pageViewController.dataSource = self;
    
    for (UIView *subview in pageViewController.view.subviews) {
        if([subview isKindOfClass:UIScrollView.class]){
            ((UIScrollView *)subview).delegate = self;
            ((UIScrollView *)subview).keyboardDismissMode = _dismissKeyboard;
            ((UIScrollView *)subview).delaysContentTouches = NO;
            self.scrollView = (UIScrollView *)subview;
        }
    }
    
    self.reactPageViewController = pageViewController;
    
    [self setupInitialController];
    
    UIPageControl *pageIndicatorView = [self createPageIndicator];
    
    pageIndicatorView.numberOfPages = self.reactSubviews.count;
    pageIndicatorView.currentPage = self.initialPage;
    pageIndicatorView.hidden = !self.showPageIndicator;
    
    self.reactPageIndicatorView = pageIndicatorView;
    
    [[self reactViewController] addChildViewController:pageViewController];
    [pageViewController.view addSubview:pageIndicatorView];
    [self addSubview:pageViewController.view];
    pageViewController.view.frame = [self bounds];
    
    [pageViewController didMoveToParentViewController:[self reactViewController]];
    [self shouldScroll:self.scrollEnabled];
    
    if (@available(iOS 9.0, *)) {
        pageIndicatorView.translatesAutoresizingMaskIntoConstraints = NO;
        NSLayoutConstraint *bottomConstraint = [pageIndicatorView.bottomAnchor constraintEqualToAnchor: pageViewController.view.bottomAnchor constant:0];
        NSLayoutConstraint *leadingConstraint = [pageIndicatorView.leadingAnchor constraintEqualToAnchor: pageViewController.view.leadingAnchor constant:0];
        NSLayoutConstraint *trailingConstraint = [pageIndicatorView.trailingAnchor constraintEqualToAnchor: pageViewController.view.trailingAnchor constant:0];
        
        [NSLayoutConstraint activateConstraints:@[bottomConstraint, leadingConstraint, trailingConstraint]];
    }
    [pageViewController.view layoutIfNeeded];
}

- (void)shouldScroll:(BOOL)scrollEnabled {
    _scrollEnabled = scrollEnabled;
    if (self.reactPageViewController.view) {
        self.scrollView.scrollEnabled = scrollEnabled;
    }
}

- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard {
    _dismissKeyboard = [dismissKeyboard  isEqual: @"on-drag"] ?
    UIScrollViewKeyboardDismissModeOnDrag : UIScrollViewKeyboardDismissModeNone;
    self.scrollView.keyboardDismissMode = _dismissKeyboard;
}

- (void)setupInitialController {
    UIView *initialView = self.reactSubviews[self.initialPage];
    if (initialView) {
        [initialView removeFromSuperview];
        UIViewController *initialController = [[UIViewController alloc] initWithView:initialView];
        
        [self setReactViewControllers:self.initialPage
                                 with:initialController
                            direction:UIPageViewControllerNavigationDirectionForward
                             animated:YES];
    }
}

- (void)setReactViewControllers:(NSInteger)index
                           with:(UIViewController *)controller
                      direction:(UIPageViewControllerNavigationDirection)direction
                       animated:(BOOL)animated {
    __weak ReactNativePageView *weakSelf = self;
    uint16_t coalescingKey = _coalescingKey++;
    
    [self.reactPageViewController setViewControllers:@[controller]
                                           direction:direction
                                            animated:animated
                                          completion:^(BOOL finished) {
        weakSelf.currentIndex = index;
        if (weakSelf.eventDispatcher) {
            [weakSelf.eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:weakSelf.reactTag position:@(index) coalescingKey:coalescingKey]];
        }
        
    }];
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    NSInteger numberOfPages = self.reactSubviews.count;
    
    if (self.currentIndex >= 0 && self.currentIndex < numberOfPages) {
        UIPageViewControllerNavigationDirection direction = (index > self.currentIndex) ? UIPageViewControllerNavigationDirectionForward : UIPageViewControllerNavigationDirectionReverse;
        
        NSInteger indexToDisplay = index < numberOfPages ? index : numberOfPages - 1;
        
        UIView *viewToDisplay = self.reactSubviews[indexToDisplay];
        [viewToDisplay removeFromSuperview];
        
        UIViewController *controllerToDisplay = [[UIViewController alloc] initWithView:viewToDisplay];
        
        self.reactPageIndicatorView.currentPage = indexToDisplay;
        
        [self setReactViewControllers:indexToDisplay
                                 with:controllerToDisplay
                            direction:direction
                             animated:animated];
    }
}

#pragma mark - Delegate

- (void)pageViewController:(UIPageViewController *)pageViewController
        didFinishAnimating:(BOOL)finished
   previousViewControllers: (nonnull NSArray<UIViewController *> *)previousViewControllers
       transitionCompleted:(BOOL)completed {
    if (completed) {
        UIViewController* currentVC = pageViewController.viewControllers.firstObject;
        NSUInteger currentIndex = [self.reactSubviews indexOfObject:currentVC.view];
        self.currentIndex = currentIndex;
        
        [_eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:self.reactTag position:@(currentIndex) coalescingKey:_coalescingKey++]];
        
        [_eventDispatcher sendEvent:[[RCTOnPageScrollEvent alloc] initWithReactTag:self.reactTag position:@(currentIndex) offset:@(0.0)]];
        self.reactPageIndicatorView.currentPage = currentIndex;
    }
}

- (UIViewController *)nextControllerForController:(UIViewController *)controller
                                      inDirection:(UIPageViewControllerNavigationDirection)direction {
    NSUInteger numberOfPages = self.reactSubviews.count;
    NSUInteger index = [self.reactSubviews indexOfObject:controller.view];
    
    if (index == NSNotFound || index == 0 || index == numberOfPages - 1) {
        return nil;
    }
    
    direction == UIPageViewControllerNavigationDirectionForward ? index++ : index--;
    
    UIView *viewToDisplay = self.reactSubviews[index];
    [viewToDisplay removeFromSuperview];
    
    return [[UIViewController alloc] initWithView:viewToDisplay];
}

#pragma mark - Datasource After

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
    return [self nextControllerForController:viewController inDirection:UIPageViewControllerNavigationDirectionForward];
}

#pragma mark - Datasource Before

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
    return [self nextControllerForController:viewController inDirection:UIPageViewControllerNavigationDirectionReverse];
}

#pragma mark - UIPageControl

- (void)shouldShowPageIndicator:(BOOL)showPageIndicator {
    _showPageIndicator = showPageIndicator;
    
    if (self.reactPageIndicatorView) {
        self.reactPageIndicatorView.hidden = !showPageIndicator;
    }
}

- (UIPageControl *)createPageIndicator {
    UIPageControl *pageControl = [[UIPageControl alloc] init];
    pageControl.tintColor = UIColor.blackColor;
    pageControl.pageIndicatorTintColor = UIColor.whiteColor;
    pageControl.currentPageIndicatorTintColor = UIColor.blackColor;
    [pageControl addTarget:self
                    action:@selector(pageControlValueChanged:)
          forControlEvents:UIControlEventValueChanged];
    
    return pageControl;
}
- (void)pageControlValueChanged:(UIPageControl *)sender {
    if (self.reactPageIndicatorView.currentPage != self.currentIndex) {
        [self goTo:self.reactPageIndicatorView.currentPage animated:YES];
    }
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"dragging" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"settling" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"idle" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    CGPoint point = scrollView.contentOffset;
    float offset = 0;
    if (self.orientation == UIPageViewControllerNavigationOrientationHorizontal) {
        offset = (point.x - self.frame.size.width)/self.frame.size.width;
    } else {
        offset = (point.y - self.frame.size.height)/self.frame.size.height;
    }
    if(fabs(offset) > 1) {
        offset = offset > 0 ? 1.0 : -1.0;
    }
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollEvent alloc] initWithReactTag:self.reactTag position:@(self.currentIndex) offset:@(offset)]];
}

@end
