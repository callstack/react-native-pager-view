#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

// The pager's native API: declared here in ObjC, implemented in Swift
// (PagerViewProvider.swift). RNCPagerViewComponentView.mm only needs this
// header, never the generated Swift one, which ObjC++ can't import under
// Swift Package Manager (the Swift sources are a separate module there).

typedef NS_CLOSED_ENUM(NSInteger, PageScrollState) {
  PageScrollStateIdle,
  PageScrollStateDragging,
  PageScrollStateSettling,
};

typedef NS_CLOSED_ENUM(NSInteger, PagerLayoutDirection) {
  PagerLayoutDirectionLtr,
  PagerLayoutDirectionRtl,
};

@protocol PagerViewProviderDelegate <NSObject>
- (void)onPageScrollWithPosition:(double)position offset:(double)offset NS_SWIFT_NAME(onPageScroll(position:offset:));
- (void)onPageScrollStateChangedWithState:(PageScrollState)state NS_SWIFT_NAME(onPageScrollStateChanged(state:));
- (void)onPageSelectedWithPosition:(NSInteger)position NS_SWIFT_NAME(onPageSelected(position:));
@end

@protocol RNCPagerViewProviding <NSObject>
@property (nonatomic) BOOL scrollEnabled;
@property (nonatomic) BOOL overdrag;
@property (nonatomic) NSInteger currentPage;
@property (nonatomic) UIScrollViewKeyboardDismissMode keyboardDismissMode;
@property (nonatomic) PagerLayoutDirection layoutDirection;
@property (nonatomic) UICollectionViewScrollDirection orientation;
- (void)insertChild:(UIView *)child atIndex:(NSInteger)index NS_SWIFT_NAME(insertChild(_:at:));
- (void)removeChildAtIndex:(NSInteger)index NS_SWIFT_NAME(removeChild(at:));
- (void)goToIndex:(NSInteger)index animated:(BOOL)animated NS_SWIFT_NAME(goTo(index:animated:));
@end

// Defined in PagerViewProvider.swift via @_cdecl.
FOUNDATION_EXTERN UIView<RNCPagerViewProviding> *RNCPagerViewCreateProvider(id<PagerViewProviderDelegate> delegate);

NS_ASSUME_NONNULL_END
