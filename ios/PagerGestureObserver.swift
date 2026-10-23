import ObjectiveC
import UIKit

/**
 Keeps the pager's pan from swallowing the navigation controller's back gesture
 (callstack/react-native-pager-view#1050). UIKit hands the touch to the scroll
 view even when recognizing simultaneously, so the pan must be refused in
 `gestureRecognizerShouldBegin`, whose delegate has to be the scroll view
 itself. Hence the runtime subclass, as in `disableSafeArea()`.

 Only an outward drag on the first page of a horizontal pager yields, and only
 while a back recognizer is actually tracking the touch. A deeper stack alone is
 not enough: the pop recognizers may be disabled, refused by their delegate, or
 edge-only with the drag starting mid-screen, and yielding would just kill the
 overdrag bounce.

 iOS 26's private `UIScrollViewPagingSwipeGestureRecognizer` flips pages on a
 flick without the pan and asks the same method, so it is refused too.
 */
final class PagerGestureObserver: NSObject {
  var currentPage = 0
  var layoutDirection: PagerLayoutDirection = .ltr
  var orientation: UICollectionView.ScrollDirection = .horizontal

  /// Attaches to the scroll view that pages: the collection view on iOS 16+,
  /// the scroll views it embeds on iOS 15 (see `PagerViewIOS15Compat`).
  func attach(to scrollView: UIScrollView) {
    let attached = objc_getAssociatedObject(scrollView, &PagerGestureObserver.associationKey)
    guard attached as? PagerGestureObserver !== self else { return }

    objc_setAssociatedObject(
      scrollView,
      &PagerGestureObserver.associationKey,
      self,
      .OBJC_ASSOCIATION_RETAIN_NONATOMIC
    )
    PagerGestureObserver.installGestureArbitration(on: scrollView)
  }

  fileprivate func yieldsToBackGesture(in scrollView: UIScrollView) -> Bool {
    guard orientation == .horizontal, currentPage == 0, backGestureCanHandleTouch(in: scrollView) else {
      return false
    }

    // The pan keeps tracking the touch even after it was refused, so it still
    // tells the direction when the paging swipe recognizer asks later in the
    // same touch sequence. Fall back to the translation when the velocity has
    // not been sampled yet.
    let pan = scrollView.panGestureRecognizer
    var dx = pan.velocity(in: scrollView).x
    if dx == 0 {
      dx = pan.translation(in: scrollView).x
    }

    return layoutDirection == .ltr ? dx > 0 : dx < 0
  }

  fileprivate static func isPagingRecognizer(
    _ gestureRecognizer: UIGestureRecognizer,
    of scrollView: UIScrollView
  ) -> Bool {
    if gestureRecognizer === scrollView.panGestureRecognizer {
      return true
    }
    return NSStringFromClass(type(of: gestureRecognizer)) == pagingSwipeRecognizerClassName
  }

  /// Walks the responder chain because the pod does not import React's `UIView`
  /// category, so `reactViewController()` is unavailable here.
  private func backGestureCanHandleTouch(in scrollView: UIScrollView) -> Bool {
    var responder: UIResponder? = scrollView.next
    var navigationController: UINavigationController?

    while let current = responder {
      if let found = current as? UINavigationController, found.viewControllers.count > 1 {
        navigationController = found
        break
      }

      responder = current.next
    }

    guard let navigationController else {
      return false
    }

    var candidates: [UIGestureRecognizer] = []

    if let recognizer = navigationController.interactivePopGestureRecognizer {
      candidates.append(recognizer)
    }

    if #available(iOS 26.0, *),
      let recognizer = navigationController.interactiveContentPopGestureRecognizer
    {
      candidates.append(recognizer)
    }

    // react-native-screens installs its own swipe recognizers on the stack view
    // above the navigation controller's view.
    var ancestor = scrollView.superview
    while let view = ancestor {
      for recognizer in view.gestureRecognizers ?? []
      where Self.screensBackRecognizerClassNames.contains(NSStringFromClass(type(of: recognizer))) {
        candidates.append(recognizer)
      }
      ancestor = view.superview
    }

    return candidates.contains(where: Self.isTrackingTouch)
  }

  /// A recognizer whose delegate refused the touch never receives it, and an
  /// edge recognizer fails once the touch starts away from its edge, so only
  /// one still holding touches in a live state can take over the drag.
  private static func isTrackingTouch(_ recognizer: UIGestureRecognizer) -> Bool {
    guard recognizer.isEnabled, recognizer.numberOfTouches > 0 else { return false }

    switch recognizer.state {
    case .possible, .began, .changed:
      return true
    default:
      return false
    }
  }
}

private extension PagerGestureObserver {
  static var associationKey: UInt8 = 0
  static let subclassSuffix = "_PagerBackGesture"
  static let pagingSwipeRecognizerClassName = "UIScrollViewPagingSwipeGestureRecognizer"
  static let screensBackRecognizerClassNames: Set<String> = [
    "RNSPanGestureRecognizer",
    "RNSScreenEdgeGestureRecognizer",
  ]

  static func installGestureArbitration(on scrollView: UIScrollView) {
    guard let currentClass = object_getClass(scrollView) else { return }

    let currentName = String(cString: class_getName(currentClass))

    // Already wearing the subclass, e.g. after a recycle.
    guard !currentName.hasSuffix(subclassSuffix) else { return }

    let subclassName = currentName.appending(subclassSuffix)

    if let existing = NSClassFromString(subclassName) {
      object_setClass(scrollView, existing)
      return
    }

    let selector = #selector(UIGestureRecognizerDelegate.gestureRecognizerShouldBegin(_:))

    guard
      let subclassNameUtf8 = (subclassName as NSString).utf8String,
      let subclass = objc_allocateClassPair(currentClass, subclassNameUtf8, 0),
      let method = class_getInstanceMethod(currentClass, selector)
    else { return }

    typealias Implementation = @convention(c) (AnyObject, Selector, UIGestureRecognizer) -> Bool

    let superImplementation = unsafeBitCast(
      method_getImplementation(method),
      to: Implementation.self
    )

    let override: @convention(block) (AnyObject, UIGestureRecognizer) -> Bool = {
      object, gestureRecognizer in
      if
        let scrollView = object as? UIScrollView,
        PagerGestureObserver.isPagingRecognizer(gestureRecognizer, of: scrollView),
        let observer = objc_getAssociatedObject(
          scrollView, &PagerGestureObserver.associationKey
        ) as? PagerGestureObserver,
        observer.yieldsToBackGesture(in: scrollView)
      {
        return false
      }

      return superImplementation(object, selector, gestureRecognizer)
    }

    class_addMethod(
      subclass,
      selector,
      imp_implementationWithBlock(override),
      method_getTypeEncoding(method)
    )

    objc_registerClassPair(subclass)
    object_setClass(scrollView, subclass)
  }
}
