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

  /// Makes this page's `safeAreaInsets` match the pager view's overlap with
  /// the screen safe area, so `contentInsetAdjustmentBehavior` on an embedded
  /// scroll view matches a list that is not inside `PagerView`.
  ///
  /// `additionalSafeAreaInsets` is *added* to what this controller already
  /// inherits. The hosting controller is a child of the RN screen, so the
  /// inherited top is often the full nav + search-bar inset even when React
  /// Native has already laid the pager out below the header. Copying
  /// `PagerViewProvider.safeAreaInsets` on top of that (or leaving the
  /// inherited value untouched when the pager's own top is 0) is the extra
  /// top inset in #1142. Negative values are required to subtract it.
  ///
  /// Do not walk to the nearest ancestor with a non-zero inset. That source
  /// is in the ancestor's own coordinate space and can track scroll offset
  /// (#1099).
  private func propagateSafeArea() {
    let insets = additionalInsets(toReach: targetSafeAreaInsets())
    if abs(additionalSafeAreaInsets.top - insets.top) > 0.5
        || abs(additionalSafeAreaInsets.left - insets.left) > 0.5
        || abs(additionalSafeAreaInsets.bottom - insets.bottom) > 0.5
        || abs(additionalSafeAreaInsets.right - insets.right) > 0.5 {
      additionalSafeAreaInsets = insets
    }
  }

  private func additionalInsets(toReach target: UIEdgeInsets) -> UIEdgeInsets {
    let inherited = UIEdgeInsets(
      top: view.safeAreaInsets.top - additionalSafeAreaInsets.top,
      left: view.safeAreaInsets.left - additionalSafeAreaInsets.left,
      bottom: view.safeAreaInsets.bottom - additionalSafeAreaInsets.bottom,
      right: view.safeAreaInsets.right - additionalSafeAreaInsets.right
    )
    return UIEdgeInsets(
      top: target.top - inherited.top,
      left: target.left - inherited.left,
      bottom: target.bottom - inherited.bottom,
      right: target.right - inherited.right
    )
  }

  private func targetSafeAreaInsets() -> UIEdgeInsets {
    guard let pager = enclosingPagerView() else {
      return view.window.map { overlap(of: view, withSafeAreaIn: $0) } ?? .zero
    }
    let container = screenView(from: pager) ?? pager.window ?? pager
    return overlap(of: pager, withSafeAreaIn: container)
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

  /// The RN screen view controller — not `PageChildViewController` (this) and
  /// not the pager's `UIHostingController`, both of which sit in the SwiftUI
  /// subtree and do not own the navigation/search-bar safe area.
  private func screenView(from pager: UIView) -> UIView? {
    var responder: UIResponder? = pager
    while let current = responder {
      if let controller = current as? UIViewController,
         !(controller is PageChildViewController),
         !(controller is UIHostingController<PagerView>) {
        return controller.view
      }
      responder = current.next
    }
    return nil
  }

  private func overlap(of child: UIView, withSafeAreaIn container: UIView) -> UIEdgeInsets {
    guard child.bounds.width > 0, child.bounds.height > 0 else {
      return .zero
    }
    let safe = container.safeAreaLayoutGuide.layoutFrame
    let frame = child.convert(child.bounds, to: container)
    return UIEdgeInsets(
      top: max(0, safe.minY - frame.minY),
      left: max(0, safe.minX - frame.minX),
      bottom: max(0, frame.maxY - safe.maxY),
      right: max(0, frame.maxX - safe.maxX)
    )
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
