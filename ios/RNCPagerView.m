
#import "RNCPagerView.h"
#import "React/RCTLog.h"
#import <React/RCTViewManager.h>

#import "UIViewController+CreateExtension.h"
#import "RCTOnPageScrollEvent.h"
#import "RNCPagerScrollView.h"
#import "RCTOnPageScrollStateChanged.h"
#import "React/RCTUIManagerObserverCoordinator.h"
#import "RCTOnPageSelected.h"
#import <math.h>

@interface RNCPagerView () <UIScrollViewDelegate>

@property(nonatomic, strong) id<RCTEventDispatcherProtocol> eventDispatcher;

@property(nonatomic, strong) RNCPagerScrollView *scrollView;
@property(nonatomic, strong) UIView *containerView;

- (void)goTo:(NSInteger)index animated:(BOOL)animated;
- (void)shouldScroll:(BOOL)scrollEnabled;
- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard;

@end

@implementation RNCPagerView {
    uint16_t _coalescingKey;
}

- (instancetype)initWithEventDispatcher:(id<RCTEventDispatcherProtocol>)eventDispatcher {
    if (self = [super init]) {
        _initialPage = 0;
        _dismissKeyboard = UIScrollViewKeyboardDismissModeNone;
        _coalescingKey = 0;
        _eventDispatcher = eventDispatcher;
        _orientation = @"horizontal";
        [self embed];
    }
    return self;
}

- (void)didMoveToWindow {
    // Disable scroll view pan gesture for navigation controller screen edge go back gesture
    if (self.reactViewController.navigationController != nil && self.reactViewController.navigationController.interactivePopGestureRecognizer != nil) {
           [self.scrollView.panGestureRecognizer requireGestureRecognizerToFail:self.reactViewController.navigationController.interactivePopGestureRecognizer];
       }
}

- (void)layoutSubviews {
    [super layoutSubviews];
    [self calculateContentSize];
}

- (void)didUpdateReactSubviews {
    [self calculateContentSize];
}

-(void) insertReactSubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    [super insertReactSubview:subview atIndex:atIndex];
    [_containerView insertSubview:subview atIndex:atIndex];
}

- (void)removeReactSubview:(UIView *)subview {
    [super removeReactSubview:subview];
    [subview removeFromSuperview];
    
    if ([self getCurrentPage] >= self.reactSubviews.count - 1) {
        [self goTo:self.reactSubviews.count - 1 animated:false];
    }
}

- (void)embed {
    _scrollView = [[RNCPagerScrollView alloc] initWithFrame:self.bounds];
    _scrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _scrollView.delaysContentTouches = NO;
    _scrollView.delegate = self;
    _scrollView.pagingEnabled = YES;
    _scrollView.showsHorizontalScrollIndicator = NO;
    _scrollView.showsVerticalScrollIndicator = NO;
    [self addSubview:_scrollView];
    
    _containerView = [[UIView alloc] initWithFrame:self.bounds];
    [_scrollView addSubview:_containerView];
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    if ([changedProps containsObject:@"overdrag"]) {
        [_scrollView setBounces:_overdrag];
    }
}

- (void)shouldScroll:(BOOL)scrollEnabled {
    if (self.scrollView) {
        self.scrollView.scrollEnabled = scrollEnabled;
    }
}

- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard {
    _dismissKeyboard = [dismissKeyboard  isEqual: @"on-drag"] ?
    UIScrollViewKeyboardDismissModeOnDrag : UIScrollViewKeyboardDismissModeNone;
    self.scrollView.keyboardDismissMode = _dismissKeyboard;
}

#pragma mark - Internal methods

- (void) calculateContentSize {
    UIView *initialView = self.containerView.subviews.firstObject;
    if (!initialView) {
        return;
    }
    
    CGFloat totalSubviewsWidth = initialView.frame.size.width * self.containerView.subviews.count;
    CGFloat totalSubviewsHeight = initialView.frame.size.height * self.containerView.subviews.count;
    
    
    if ([self isHorizontal]) {
        _scrollView.contentSize = CGSizeMake(totalSubviewsWidth, 0);
        _containerView.frame = CGRectMake(0, 0, totalSubviewsWidth, initialView.bounds.size.height);
    } else {
        _scrollView.contentSize = CGSizeMake(0, totalSubviewsHeight);
        _containerView.frame = CGRectMake(0, 0, initialView.bounds.size.width, totalSubviewsHeight);
    }
    
    _scrollView.frame = self.bounds;
    [self.scrollView layoutIfNeeded];
    
    if (self.initialPage != 0) {
        [self goTo:self.initialPage animated:false];
    }
}

- (void)disableSwipe {
    [_scrollView setScrollEnabled:false];
}

- (void)enableSwipe {
    [_scrollView setScrollEnabled:true];
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    CGPoint targetOffset = [self isHorizontal] ? CGPointMake(_scrollView.frame.size.width * index, 0) : CGPointMake(0, _scrollView.frame.size.height * index);
        
    if (animated) {
        self.animating = true;
    }
    
    [_scrollView setContentOffset:targetOffset animated:animated];
    
    if (!animated) {
        int position = [self getCurrentPage];
        [self.eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:self.reactTag position:[NSNumber numberWithInt:position] coalescingKey:_coalescingKey++]];
    }
}

- (BOOL)isHorizontal {
    return [_orientation isEqualToString:@"horizontal"];
}

-(int)getCurrentPage {
    return [self isHorizontal] ? _scrollView.contentOffset.x / _scrollView.frame.size.width : _scrollView.contentOffset.y / _scrollView.frame.size.height;
}

#pragma mark - UIScrollViewDelegate


- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"dragging" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"settling" coalescingKey:_coalescingKey++]];
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    int position = [self getCurrentPage];
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollStateChanged alloc] initWithReactTag:self.reactTag state:@"idle" coalescingKey:_coalescingKey++]];
    
    [self.eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:self.reactTag position:[NSNumber numberWithInt:position] coalescingKey:_coalescingKey++]];
}

-(void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    int position = [self getCurrentPage];
    self.animating = false;
    [self.eventDispatcher sendEvent:[[RCTOnPageSelected alloc] initWithReactTag:self.reactTag position:[NSNumber numberWithInt:position] coalescingKey:_coalescingKey++]];
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    int position = [self getCurrentPage];
    
    double offset = [self isHorizontal] ? (scrollView.contentOffset.x - (scrollView.frame.size.width * position))/scrollView.frame.size.width : (scrollView.contentOffset.y - (scrollView.frame.size.height * position))/scrollView.frame.size.height;
    
    [self.eventDispatcher sendEvent:[[RCTOnPageScrollEvent alloc] initWithReactTag:self.reactTag position:@(position) offset:@(offset)]];
}
@end

