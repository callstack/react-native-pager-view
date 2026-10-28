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
