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

  /// Re-applies safe area insets from a stable UIKit source, since SwiftUI's
  /// .ignoresSafeArea() causes embedded UIKit views to report .zero.
  private func propagateSafeArea() {
    let insets = nearestNonZeroSafeAreaInsets() ?? view.window?.safeAreaInsets ?? .zero
    if abs(additionalSafeAreaInsets.top - insets.top) > 0.5
        || abs(additionalSafeAreaInsets.left - insets.left) > 0.5
        || abs(additionalSafeAreaInsets.bottom - insets.bottom) > 0.5
        || abs(additionalSafeAreaInsets.right - insets.right) > 0.5 {
      additionalSafeAreaInsets = insets
    }
  }

  private func nearestNonZeroSafeAreaInsets() -> UIEdgeInsets? {
    var current = view.superview
    while let candidate = current {
      let insets = candidate.safeAreaInsets
      if insets.top > 0 || insets.left > 0 || insets.bottom > 0 || insets.right > 0 {
        return insets
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
