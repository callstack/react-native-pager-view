
#import "RNCPagerView.h"
#import "React/RCTLog.h"
#import <React/RCTViewManager.h>

#import "UIViewController+CreateExtension.h"
#import "RCTOnPageScrollEvent.h"
#import "RCTOnPageScrollStateChanged.h"
#import "React/RCTUIManagerObserverCoordinator.h"
#import "RCTOnPageSelected.h"
#import <math.h>

@interface RNCPagerView () <UIScrollViewDelegate>

@property(nonatomic, strong) id<RCTEventDispatcherProtocol> eventDispatcher;

@property(nonatomic, strong) UIScrollView *scrollView;
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
#if !TARGET_OS_VISION
        _dismissKeyboard = UIScrollViewKeyboardDismissModeNone;
#endif
        _coalescingKey = 0;
        _eventDispatcher = eventDispatcher;
        _orientation = @"horizontal";
        [self embed];
    }
    return self;
}

- (void)didUpdateReactSubviews {
    [self updateContentSizeIfNeeded];
}

- (void)reactSetFrame:(CGRect)frame {
    [super reactSetFrame:frame];
    [self updateContentSizeIfNeeded];
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
    _scrollView = [[UIScrollView alloc] initWithFrame:self.bounds];
    _scrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _scrollView.delaysContentTouches = NO;
    _scrollView.delegate = self;
    _scrollView.pagingEnabled = YES;
    _scrollView.showsHorizontalScrollIndicator = NO;
    _scrollView.showsVerticalScrollIndicator = NO;
    _scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
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

#if !TARGET_OS_VISION
- (void)shouldDismissKeyboard:(NSString *)dismissKeyboard {
    _dismissKeyboard = [dismissKeyboard  isEqual: @"on-drag"] ?
    UIScrollViewKeyboardDismissModeOnDrag : UIScrollViewKeyboardDismissModeNone;
    self.scrollView.keyboardDismissMode = _dismissKeyboard;
}
#endif

#pragma mark - Internal methods

- (CGSize)contentSize
{
    UIView *initialView = _containerView.subviews.firstObject;
    CGFloat subviewsCount = _containerView.subviews.count;
    return CGSizeMake(initialView.bounds.size.width * subviewsCount, initialView.bounds.size.height * subviewsCount);
}

- (void)updateContentSizeIfNeeded
{
    CGSize contentSize = self.contentSize;
    if (!CGSizeEqualToSize(_scrollView.contentSize, contentSize)){
        _scrollView.contentSize = [self isHorizontal] ? CGSizeMake(contentSize.width, 0) : CGSizeMake(0, contentSize.height);
        _containerView.frame = CGRectMake(0, 0, contentSize.width, contentSize.height);
        
        if (self.initialPage != 0) {
            [self goTo:self.initialPage animated:false];
        }
    }
}

- (void)disableSwipe {
    [_scrollView setScrollEnabled:false];
}

- (void)enableSwipe {
    [_scrollView setScrollEnabled:true];
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    if ([self getCurrentPage] == index) {
        return;
    }
    
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

