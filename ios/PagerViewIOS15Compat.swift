import UIKit

/// Workarounds for the SwiftUI paged `TabView` on iOS 15.
///
/// On iOS 15 SwiftUI implements `.tabViewStyle(.page)` with a compositional layout that pages
/// orthogonally: the horizontal paging is performed by an embedded `UIScrollView` subview of the
/// collection view (private class `_UICollectionViewOrthogonalScrollerEmbeddedScrollView`), while
/// the collection view itself only scrolls vertically. Because `PagerView` can only toggle the
/// collection view, on iOS 15 `scrollEnabled={false}` / `overdrag={false}` never reached the view
/// that actually handles the swipe.
///
/// On iOS 16 and later the collection view itself is the pager, so none of this is needed — the
/// `#available` checks below make every function in here a no-op on those versions.
///
/// - Note: Delete this file together with the two `PagerViewIOS15Compat` calls in `PagerView.swift`
///   once the minimum supported iOS version is 16.
enum PagerViewIOS15Compat {
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
