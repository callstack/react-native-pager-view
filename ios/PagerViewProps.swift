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

/// A `setPage` with the `direct` animation, see `PagerViewProvider.slideDirectly(to:after:)`.
struct PageTransition {
  let id = UUID()
  /// The target's neighbour, which hosts `leftPage` during the slide.
  let passingPage: Int
  let targetPage: Int
  let leftPage: UIView
  var isSliding = false
}

class PagerViewProps: ObservableObject {
  @Published var children: [IdentifiablePlatformView] = []
  @Published var currentPage: Int = -1
  @Published var scrollEnabled: Bool = true
  @Published var overdrag: Bool = false
  @Published var keyboardDismissMode: UIScrollView.KeyboardDismissMode = .none
  @Published var layoutDirection: PagerLayoutDirection = .ltr
  @Published var orientation: UICollectionView.ScrollDirection = .horizontal
  @Published var pageTransition: PageTransition?
  /// Not published: holding it must not re-render the pager.
  weak var collectionView: UICollectionView?

  /// While a slide runs, TabView writes the page nearest the offset into the
  /// selection, which overwrites a new one before TabView acts on it. Stopping
  /// the slide where it is leaves TabView nothing to write.
  func stopSlideBeforeSelectionChange() {
    guard #available(iOS 16, *),
          let collectionView,
          !collectionView.isTracking,
          !collectionView.isDecelerating,
          let heading = collectionView.animatedScrollTarget,
          abs(collectionView.contentOffset.x - heading.x) >= 1 else {
      return
    }
    collectionView.setContentOffset(collectionView.contentOffset, animated: false)
  }

  /// TabView starts no scroll for a selection that is the page nearest the
  /// offset, so a slide redirected to the page it is passing runs on to its
  /// old target, and TabView then writes that page back as the selection.
  func scrollToSelectionSkippedMidSlide(_ page: Int, animated: Bool) {
    // A later command or TabView itself may have changed the selection since.
    guard #available(iOS 16, *),
          page == currentPage,
          pageTransition == nil,
          let collectionView,
          !collectionView.isTracking,
          !collectionView.isDecelerating,
          collectionView.numberOfSections > 0 else {
      return
    }
    // Pages added or removed in the same pass are not in the collection view yet.
    let pageCount = collectionView.numberOfItems(inSection: 0)
    let pageSize = collectionView.frame.width
    guard page < pageCount, pageSize > 0 else {
      return
    }
    // The offset is physical, and a right-to-left layout mirrors it.
    let physicalPage = layoutDirection == .rtl ? pageCount - 1 - page : page
    guard Int((collectionView.contentOffset.x / pageSize).rounded()) == physicalPage else {
      return
    }
    let target = CGPoint(x: CGFloat(physicalPage) * pageSize, y: collectionView.contentOffset.y)
    // TabView started a slide there, which a slow main thread can let pass the
    // middle before this check runs. A second scroll would replace that slide,
    // and TabView takes the selection from the offset while the new one runs.
    if let heading = collectionView.animatedScrollTarget, abs(heading.x - target.x) < 1 {
      return
    }
    // Already there, with nothing running that could move it on.
    if collectionView.animatedScrollTarget == nil && abs(collectionView.contentOffset.x - target.x) < 1 {
      return
    }
    // An animated scroll to the offset already shown does nothing and leaves
    // the old slide running, so a slide crossing the page exactly is stopped.
    collectionView.setContentOffset(
      target,
      animated: animated && abs(collectionView.contentOffset.x - target.x) >= 1
    )
  }

  /// The page the selection names, held inside the pages that exist. Nothing
  /// clamps the index a command carries, and `-1` stands for no selection yet.
  var clampedCurrentPage: Int {
    guard !children.isEmpty else {
      return 0
    }
    return min(max(currentPage, 0), children.count - 1)
  }

  /// A page counted the other way round, which only a right-to-left layout
  /// changes. Mirroring twice gives the page back, so this converts both ways.
  func mirroredPage(_ page: Int) -> Int {
    guard !children.isEmpty, layoutDirection == .rtl else {
      return page
    }
    return children.count - 1 - page
  }

  /// Blurs a text input focused on any page other than `page`. The paged
  /// `TabView` keeps neighbouring pages in the window, so nothing else does.
  /// An index that is not a page leaves every input alone, since there would
  /// be no page to spare from the blur.
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
