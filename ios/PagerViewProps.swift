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

  /// True when the pager is moving or about to move, so the rest handler will
  /// do the blur.
  func restWillFollow(movingTo page: Int) -> Bool {
    // iOS 15 pages through embedded scroll views and reports no rest to wait for.
    guard #available(iOS 16, *) else {
      return false
    }
    // Rests come from our delegate, which a TabView rebuilt for a new page
    // count gets only once the old one is freed.
    guard let collectionView = scrollView as? UICollectionView,
          collectionView.frame.width > 0,
          collectionView.delegate is PagerScrollDelegate,
          collectionView.numberOfSections > 0,
          collectionView.numberOfItems(inSection: 0) == children.count else {
      return false
    }
    // No rest is reported while a finger is down, or when one that never
    // dragged lifts.
    if collectionView.isTracking && !collectionView.isDragging {
      return false
    }
    if collectionView.isDragging || collectionView.isDecelerating || !collectionView.isOnPageBoundary {
      return true
    }
    // At rest with a selection the slide has not started for yet, as when one
    // `setPage` follows another in the same pass. The offset is physical, and
    // a right-to-left layout mirrors it.
    let physicalPage = Int((collectionView.contentOffset.x / collectionView.frame.width).rounded())
    let shownPage = layoutDirection == .rtl ? children.count - 1 - physicalPage : physicalPage
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
