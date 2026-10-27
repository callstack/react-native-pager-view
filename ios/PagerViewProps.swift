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
  func resignFirstResponder(outsidePage page: Int) {
    for (index, child) in children.enumerated() where index != page {
      if let responder = child.view.firstResponderInHierarchy, responder is UIKeyInput {
        responder.resignFirstResponder()
        return
      }
    }
  }
}
