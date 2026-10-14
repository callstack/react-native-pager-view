import UIKit
#if SWIFT_PACKAGE
import react_native_pager_view
#endif

/// Workarounds for the SwiftUI paged `TabView` on iOS 15.
///
/// On iOS 15 SwiftUI implements `.tabViewStyle(.page)` with a compositional layout that pages
/// orthogonally: the horizontal paging is performed by an embedded `UIScrollView` subview of the
/// collection view (private class `_UICollectionViewOrthogonalScrollerEmbeddedScrollView`), while
/// the collection view itself only scrolls vertically. Because `PagerView` can only toggle the
/// collection view, on iOS 15 `scrollEnabled={false}` / `overdrag={false}` never reached the view
/// that actually handles the swipe, and the back-gesture arbitration of `PagerGestureObserver`
/// never reached the pan that blocks it. For the same reason `PagerScrollDelegate`, installed on
/// the collection view, never saw the paging scroll, so `onPageScroll` / `onPageScrollStateChanged`
/// were never emitted.
///
/// On iOS 16 and later the collection view itself is the pager, so none of this is needed — the
/// `#available` checks below make every function in here a no-op on those versions.
///
/// - Note: Delete this file and `PagerScrollDelegateIOS15.swift` together with the
///   `PagerViewIOS15Compat` calls and the `PagerScrollDelegateIOS15` choice in `PagerView.swift`
///   once the minimum supported iOS version is 16.
enum PagerViewIOS15Compat {
  private static var scrollDelegateKey: UInt8 = 0
  private static var originalDelegateKey: UInt8 = 0

  /// Mirrors `scrollEnabled` onto the scroll views SwiftUI embedded in the paging collection view.
  static func applyScrollEnabled(_ scrollEnabled: Bool, to collectionView: UICollectionView?) {
    if #available(iOS 16, *) {
      return
    }

    pagingScrollViews(in: collectionView).forEach { $0.isScrollEnabled = scrollEnabled }
  }

  /// Mirrors `overdrag` onto the scroll views SwiftUI embedded in the paging collection view.
  static func applyOverdrag(_ overdrag: Bool, to collectionView: UICollectionView?) {
    if #available(iOS 16, *) {
      return
    }

    pagingScrollViews(in: collectionView).forEach { $0.bounces = overdrag }
  }

  /// Attaches the back-gesture arbitration to the scroll views SwiftUI embedded in the paging
  /// collection view.
  static func attachGestureObserver(
    _ gestureObserver: PagerGestureObserver,
    to collectionView: UICollectionView?
  ) {
    if #available(iOS 16, *) {
      return
    }

    pagingScrollViews(in: collectionView).forEach { gestureObserver.attach(to: $0) }
  }

  /// Puts a `PagerScrollDelegate` in front of the delegate of the scroll views SwiftUI embedded in
  /// the paging collection view. They only exist once the collection view has laid out its pages.
  static func attachScrollDelegate(
    to collectionView: UICollectionView,
    delegate: PagerViewProviderDelegate?
  ) {
    if #available(iOS 16, *) {
      return
    }

    for scrollView in pagingScrollViews(in: collectionView) {
      if scrollView.delegate is PagerScrollDelegate {
        continue
      }

      let originalDelegate = ScrollViewDelegateForwarder(target: scrollView.delegate)
      let scrollDelegate = PagerScrollDelegate()
      scrollDelegate.originalDelegate = originalDelegate
      scrollDelegate.delegate = delegate
      // Both delegate references are weak; the scroll view owns them instead.
      let policy = objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN_NONATOMIC
      objc_setAssociatedObject(scrollView, &scrollDelegateKey, scrollDelegate, policy)
      objc_setAssociatedObject(scrollView, &originalDelegateKey, originalDelegate, policy)
      scrollView.delegate = scrollDelegate
    }
  }

  /// Scroll views that SwiftUI embedded in the paging collection view.
  ///
  /// Scroll views that belong to the pages' React Native content live inside the paging cells, so
  /// the traversal stops at cell boundaries and never touches the user's own scroll views.
  private static func pagingScrollViews(in collectionView: UICollectionView?) -> [UIScrollView] {
    guard let collectionView else { return [] }

    return collectPagingScrollViews(in: collectionView)
  }

  private static func collectPagingScrollViews(in view: UIView) -> [UIScrollView] {
    var scrollViews: [UIScrollView] = []

    for subview in view.subviews {
      if subview is UICollectionViewCell {
        continue
      }

      if let scrollView = subview as? UIScrollView {
        scrollViews.append(scrollView)
      }

      scrollViews.append(contentsOf: collectPagingScrollViews(in: subview))
    }

    return scrollViews
  }
}

/// `PagerScrollDelegate` forwards to a `UICollectionViewDelegate`, but the embedded scroll views'
/// own delegate (UIKit's `_UICollectionViewOrthogonalScrollerSectionController`) is only a
/// `UIScrollViewDelegate`. This passes every call through to it.
private final class ScrollViewDelegateForwarder: NSObject, UICollectionViewDelegate {
  private weak var target: UIScrollViewDelegate?

  init(target: UIScrollViewDelegate?) {
    self.target = target
  }

  override func responds(to aSelector: Selector!) -> Bool {
    target?.responds(to: aSelector) ?? false
  }

  override func forwardingTarget(for aSelector: Selector!) -> Any? {
    target
  }
}
