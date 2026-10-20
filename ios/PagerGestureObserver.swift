import ObjectiveC
import UIKit

/**
 Keeps the pager's pan from swallowing the navigation controller's back gesture.

 react-native-screens' full-screen swipe (its own pan recognizer before iOS 26,
 the system `interactiveContentPopGestureRecognizer` from iOS 26) spans the whole
 screen, so a pager on top of it takes every horizontal drag
 (callstack/react-native-pager-view#1050). The 6.x UIKit pager solved this in a
 gesture delegate; the SwiftUI pager has none. Allowing the two to recognize
 simultaneously does not help, UIKit still hands the touch to the scroll view,
 so the pan has to be refused before it begins. That answer belongs to
 `gestureRecognizerShouldBegin`, which the pan asks its delegate, and UIKit
 insists that delegate is the scroll view itself. Hence the runtime subclass,
 the same trick `disableSafeArea()` uses in `Extensions.swift`.

 Only the first page of a horizontal pager yields, and only while there is
 somewhere to go back to; there a back-swipe has nothing to scroll to anyway.
 Every other drag reaches the original implementation untouched.

 iOS 26 adds a private `UIScrollViewPagingSwipeGestureRecognizer` to paging
 scroll views that flips a page on a quick flick even when the pan never
 begins, and it asks the same delegate method. It has to be refused too, or
 only slow drags reach the back gesture.
 */
final class PagerGestureObserver: NSObject {
  var currentPage = 0
  var layoutDirection: PagerLayoutDirection = .ltr
  var orientation: UICollectionView.ScrollDirection = .horizontal

  private weak var collectionView: UICollectionView?

  func attach(to collectionView: UICollectionView) {
    guard self.collectionView !== collectionView else { return }

    self.collectionView = collectionView
    objc_setAssociatedObject(
      collectionView,
      &PagerGestureObserver.associationKey,
      self,
      .OBJC_ASSOCIATION_RETAIN_NONATOMIC
    )
    PagerGestureObserver.installGestureArbitration(on: collectionView)
  }

  fileprivate func yieldsToBackGesture(in scrollView: UIScrollView) -> Bool {
    guard orientation == .horizontal, currentPage == 0, canNavigateBack(from: scrollView) else {
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
  private func canNavigateBack(from view: UIView) -> Bool {
    var responder: UIResponder? = view.next

    while let current = responder {
      if let navigationController = current as? UINavigationController {
        return navigationController.viewControllers.count > 1
      }

      responder = current.next
    }

    return false
  }
}

private extension PagerGestureObserver {
  static var associationKey: UInt8 = 0
  static let subclassSuffix = "_PagerBackGesture"
  static let pagingSwipeRecognizerClassName = "UIScrollViewPagingSwipeGestureRecognizer"

  static func installGestureArbitration(on collectionView: UICollectionView) {
    guard let currentClass = object_getClass(collectionView) else { return }

    let currentName = String(cString: class_getName(currentClass))

    // Already wearing the subclass, e.g. after a recycle.
    guard !currentName.hasSuffix(subclassSuffix) else { return }

    let subclassName = currentName.appending(subclassSuffix)

    if let existing = NSClassFromString(subclassName) {
      object_setClass(collectionView, existing)
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
    object_setClass(collectionView, subclass)
  }
}
