import Foundation
import SwiftUI
import UIKit

/**
 Helper used to render UIView inside of SwiftUI.
 Uses UIViewControllerRepresentable to re-inject safe area insets
 that SwiftUI's .ignoresSafeArea() strips from child UIKit views.
 */
struct RepresentableView: UIViewControllerRepresentable {
  var view: UIView

  func makeUIViewController(context: Context) -> PageChildViewController {
    let viewController = PageChildViewController()
    viewController.wrappedView = view
    return viewController
  }

  func updateUIViewController(_ uiViewController: PageChildViewController, context: Context) {}
}

class PageChildViewController: UIViewController {
  var wrappedView: UIView?

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .clear
    if let wrappedView {
      view.addSubview(wrappedView)
    }
  }

  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    propagateSafeArea()
  }

  override func viewSafeAreaInsetsDidChange() {
    super.viewSafeAreaInsetsDidChange()
    propagateSafeArea()
  }

  /// Re-applies the pager's safe area to child UIKit views. SwiftUI's
  /// `.ignoresSafeArea()` and `UIHostingController(ignoreSafeArea:)` both make
  /// this controller report `.zero`, which breaks
  /// `contentInsetAdjustmentBehavior` on embedded scroll views.
  ///
  /// Do not walk to the nearest ancestor with a non-zero inset. That source is
  /// in the ancestor's own coordinate space: an inner `_UIHostingView` often
  /// has only the home-indicator edge (#1142), and a `UIScrollView` content
  /// view's inset tracks scroll offset (#1099).
  ///
  /// `PagerViewProvider` sits in the React Native hierarchy under the screen
  /// view controller, so its `safeAreaInsets` include a native search bar and
  /// are zero when this pager does not overlap the unsafe region.
  private func propagateSafeArea() {
    let insets = targetSafeAreaInsets()
    if abs(additionalSafeAreaInsets.top - insets.top) > 0.5
        || abs(additionalSafeAreaInsets.left - insets.left) > 0.5
        || abs(additionalSafeAreaInsets.bottom - insets.bottom) > 0.5
        || abs(additionalSafeAreaInsets.right - insets.right) > 0.5 {
      additionalSafeAreaInsets = insets
    }
  }

  private func targetSafeAreaInsets() -> UIEdgeInsets {
    if let pager = enclosingPagerView() {
      return pager.safeAreaInsets
    }
    return view.window?.safeAreaInsets ?? .zero
  }

  private func enclosingPagerView() -> UIView? {
    var current = view.superview
    while let candidate = current {
      if candidate is PagerViewProvider {
        return candidate
      }
      current = candidate.superview
    }
    return nil
  }
}

extension Collection {
  // Returns the element at the specified index if it is within bounds, otherwise nil.
  subscript(safe index: Index) -> Element? {
    indices.contains(index) ? self[index] : nil
  }
}

extension UIView {
  func pinEdges(to other: UIView) {
    NSLayoutConstraint.activate([
      leadingAnchor.constraint(equalTo: other.leadingAnchor),
      trailingAnchor.constraint(equalTo: other.trailingAnchor),
      topAnchor.constraint(equalTo: other.topAnchor),
      bottomAnchor.constraint(equalTo: other.bottomAnchor)
    ])
  }
}

extension UIHostingController {
  convenience public init(rootView: Content, ignoreSafeArea: Bool) {
    self.init(rootView: rootView)

    if ignoreSafeArea {
      disableSafeArea()
    }
  }

  /// Disables safe area insets by dynamically subclassing the hosting controller's view
  /// and overriding safeAreaInsets to return .zero.
  func disableSafeArea() {
    guard let viewClass = object_getClass(view) else { return }

    let viewSubclassName = String(cString: class_getName(viewClass)).appending("_IgnoreSafeArea")
    if let viewSubclass = NSClassFromString(viewSubclassName) {
      object_setClass(view, viewSubclass)
    }
    else {
      guard let viewClassNameUtf8 = (viewSubclassName as NSString).utf8String else { return }
      guard let viewSubclass = objc_allocateClassPair(viewClass, viewClassNameUtf8, 0) else { return }

      if let method = class_getInstanceMethod(UIView.self, #selector(getter: UIView.safeAreaInsets)) {
        let safeAreaInsets: @convention(block) (AnyObject) -> UIEdgeInsets = { _ in
          return .zero
        }
        class_addMethod(viewSubclass, #selector(getter: UIView.safeAreaInsets), imp_implementationWithBlock(safeAreaInsets), method_getTypeEncoding(method))
      }

      objc_registerClassPair(viewSubclass)
      object_setClass(view, viewSubclass)
    }
  }
}
