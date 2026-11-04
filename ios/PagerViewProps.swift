import SwiftUI
import UIKit
#if SWIFT_PACKAGE
import react_native_pager_view
#endif

struct IdentifiablePlatformView: Identifiable, Equatable {
  let id = UUID()
  let view: UIView

  init(_ view: UIView) {
    self.view = view
  }
}

extension PagerLayoutDirection {
  var converted: LayoutDirection {
    switch self {
    case .ltr:
      return .leftToRight
    case .rtl:
      return .rightToLeft
    }
  }
}

class PagerViewProps: ObservableObject {
  @Published var children: [IdentifiablePlatformView] = []
  @Published var currentPage: Int = -1
  @Published var scrollEnabled: Bool = true
  @Published var overdrag: Bool = false
  @Published var keyboardDismissMode: UIScrollView.KeyboardDismissMode = .none
  @Published var layoutDirection: PagerLayoutDirection = .ltr
  @Published var orientation: UICollectionView.ScrollDirection = .horizontal
  /// The `TabView`'s collection view, read to tell whether a slide is under way.
  weak var scrollView: UIScrollView?

  /// True when the pager is moving, or about to move away from the page shown
  /// to `page`, so a rest follows and blurs every page but the one it lands on.
  func restWillFollow(movingTo page: Int) -> Bool {
    // iOS 15 pages through embedded scroll views and reports no rest to wait for.
    guard #available(iOS 16, *) else {
      return false
    }
    // Rests come from our delegate, which a rebuilt TabView may not have yet.
    guard let scrollView, scrollView.frame.width > 0,
          scrollView.delegate is PagerScrollDelegate else {
      return false
    }
    // A finger only resting on the pager is not a drag, and lifting it reports
    // no rest, so tracking alone does not count.
    if scrollView.isDragging || scrollView.isDecelerating || !scrollView.isOnPageBoundary {
      return true
    }
    // The offset is physical, and a right-to-left layout mirrors it against the
    // collection view's own count, which can trail `children` by a pass.
    let physicalPage = Int((scrollView.contentOffset.x / scrollView.frame.width).rounded())
    var shownPage = physicalPage
    if layoutDirection == .rtl {
      var pageCount = children.count
      if let collectionView = scrollView as? UICollectionView, collectionView.numberOfSections > 0 {
        pageCount = collectionView.numberOfItems(inSection: 0)
      }
      shownPage = pageCount - 1 - physicalPage
    }
    // A command for the page shown moves nothing, so no rest follows it.
    return shownPage != currentPage && shownPage != page
  }

  /// Blurs a text input focused on any page other than `page`. The paged
  /// `TabView` keeps neighbouring pages in the window, so nothing else does.
  /// An index that is not a page leaves every input alone: there is no page to
  /// spare from the blur.
  func resignFirstResponder(outsidePage page: Int) {
    guard children.indices.contains(page) else {
      return
    }
    for (index, child) in children.enumerated() where index != page {
      guard child.view.window != nil,
            let responder = child.view.firstResponderInHierarchy else {
        continue
      }
      // A view that takes no text, such as one holding key commands, is not an
      // input, and one that brings its own keyboard is.
      if responder is UIKeyInput
        || responder.inputView != nil
        || responder.inputViewController != nil {
        responder.resignFirstResponder()
      }
      return
    }
  }
}
