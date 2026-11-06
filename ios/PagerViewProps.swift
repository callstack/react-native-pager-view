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
