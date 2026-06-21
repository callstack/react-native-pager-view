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
    propagateHostingSafeArea()
  }

  /// Traverses up to the _UIHostingView and re-applies its bottom safe area
  /// as additionalSafeAreaInsets on this child VC, since .ignoresSafeArea()
  /// causes UIKit to report safeAreaInsets = .zero for embedded views.
  private func propagateHostingSafeArea() {
    var current: UIView? = view.superview
    while let v = current {
      if String(describing: type(of: v)).contains("_UIHostingView") {
        let hosting = v.safeAreaInsets
        let delta = UIEdgeInsets(
          top: hosting.top, left: hosting.left,
          bottom: hosting.bottom, right: hosting.right
        )
        if abs(additionalSafeAreaInsets.top - delta.top) > 0.5
            || abs(additionalSafeAreaInsets.left - delta.left) > 0.5
            || abs(additionalSafeAreaInsets.bottom - delta.bottom) > 0.5
            || abs(additionalSafeAreaInsets.right - delta.right) > 0.5 {
          additionalSafeAreaInsets = delta
        }
        return
      }
      current = v.superview
    }
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

