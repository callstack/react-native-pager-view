import ObjectiveC
import UIKit
#if SWIFT_PACKAGE
import react_native_pager_view
#endif

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

 With `yieldToNestedGestures`, it also yields to a pan inside the page that the
 touch started on and that is still tracking it: a swipeable row, a slider, a
 swipe to reply. The view the touch landed on comes from the touch itself
 (`gestureRecognizer(_:shouldReceive:)`), not a hit test, which re-enters the
 hosting view. Once yielded, the rest of that touch sequence is too: a flick's
 paging swipe asks as the finger lifts, by when the nested pan may have ended.
 */
final class PagerGestureObserver: NSObject {
  var currentPage = 0
  var layoutDirection: PagerLayoutDirection = .ltr
  var orientation: UICollectionView.ScrollDirection = .horizontal
  var yieldToNestedGestures = false

  /// Where the current touch sequence landed, and whether the pager has
  /// yielded it to a nested pan.
  fileprivate weak var touchedView: UIView?
  fileprivate var yieldedTouch = false

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

  /// Asked as the pan receives a touch: a new sequence starts with the first.
  fileprivate func touchBegan(on view: UIView?, in scrollView: UIScrollView) {
    guard scrollView.panGestureRecognizer.numberOfTouches == 0 else { return }
    touchedView = view
    yieldedTouch = false
  }

  fileprivate func yieldsToNestedGesture(in scrollView: UIScrollView) -> Bool {
    guard yieldToNestedGestures else { return false }
    if yieldedTouch { return true }

    var view = touchedView
    while let current = view, current !== scrollView {
      for recognizer in current.gestureRecognizers ?? []
      where Self.isNestedPan(recognizer) && Self.isTrackingTouch(recognizer) {
        yieldedTouch = true
        return true
      }
      view = current.superview
    }
    return false
  }

  /// A pan of the page's content's own: not a scroll view's, whose pan
  /// tracks every touch on a list and would stop the pager paging at all.
  private static func isNestedPan(_ recognizer: UIGestureRecognizer) -> Bool {
    guard recognizer is UIPanGestureRecognizer else { return false }
    if let owner = recognizer.view as? UIScrollView, owner.panGestureRecognizer === recognizer {
      return false
    }
    return true
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

  /// Walks the responder chain for a navigation controller that can go back:
  /// `reactViewController()` would stop at the nearest controller instead.
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
        observer.yieldsToBackGesture(in: scrollView) || observer.yieldsToNestedGesture(in: scrollView)
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
    addTouchRecorder(to: subclass, from: currentClass)

    // On iOS 15 this observer also governs the collection view, which scrolls
    // vertically there, and the scroll views embedded in it that do the
    // paging, so the override would stop scrolling that is not paging.
    if #available(iOS 16, *) {
      addRevealOverride(to: subclass, from: currentClass)
      addScrollTargetRecorder(to: subclass, from: currentClass)
    }

    objc_registerClassPair(subclass)
    object_setClass(scrollView, subclass)
  }

  /// Records the view each touch sequence lands on, for
  /// `yieldsToNestedGesture`: the pan's delegate is the scroll view itself, so
  /// this is the one place the touch passes through before the pan asks to
  /// begin. Defers to UIScrollView's own answer.
  private static func addTouchRecorder(to subclass: AnyClass, from currentClass: AnyClass) {
    // By name: `gestureRecognizer(_:shouldReceive:)` is also the UIPress and
    // UIEvent variants, which #selector can't tell apart.
    let selector = NSSelectorFromString("gestureRecognizer:shouldReceiveTouch:")

    guard let method = class_getInstanceMethod(currentClass, selector) else {
      return
    }

    typealias ShouldReceive = @convention(c) (AnyObject, Selector, UIGestureRecognizer, UITouch) -> Bool

    let superImplementation = unsafeBitCast(method_getImplementation(method), to: ShouldReceive.self)

    let override: @convention(block) (AnyObject, UIGestureRecognizer, UITouch) -> Bool = {
      object, gestureRecognizer, touch in
      if
        let scrollView = object as? UIScrollView,
        gestureRecognizer === scrollView.panGestureRecognizer,
        let observer = objc_getAssociatedObject(
          scrollView, &PagerGestureObserver.associationKey
        ) as? PagerGestureObserver
      {
        observer.touchBegan(on: touch.view, in: scrollView)
      }
      return superImplementation(object, selector, gestureRecognizer, touch)
    }

    class_addMethod(
      subclass,
      selector,
      imp_implementationWithBlock(override),
      method_getTypeEncoding(method)
    )
  }

  /// UIKit reveals a first responder by scrolling the nearest scrolling
  /// ancestor, which for a pager is the view that pages. The pager moves only
  /// between pages, so such a scroll can only take it off the page the
  /// selection names and leave it between two of them, and a reveal that
  /// arrives while the pager is moving replaces the page it was asked for.
  /// Every one of them is declined, so the selection stays the only thing
  /// that moves the pager. A field inside a page is still revealed by the
  /// scroll views within that page, which this leaves alone.
  private static func addRevealOverride(to subclass: AnyClass, from currentClass: AnyClass) {
    let selector = #selector(UIScrollView.scrollRectToVisible(_:animated:))

    guard let method = class_getInstanceMethod(currentClass, selector) else {
      return
    }

    let override: @convention(block) (AnyObject, CGRect, Bool) -> Void = { _, _, _ in }

    class_addMethod(
      subclass,
      selector,
      imp_implementationWithBlock(override),
      method_getTypeEncoding(method)
    )
  }

  /// Records where an animated scroll is heading, which UIKit does not expose.
  /// `TabView` starts each slide this way, so the pager can tell a slide it
  /// started from one it skipped.
  private static func addScrollTargetRecorder(to subclass: AnyClass, from currentClass: AnyClass) {
    let selector = #selector(UIScrollView.setContentOffset(_:animated:))

    guard let method = class_getInstanceMethod(currentClass, selector) else {
      return
    }

    typealias SetContentOffset = @convention(c) (AnyObject, Selector, CGPoint, Bool) -> Void
    let superImplementation = unsafeBitCast(method_getImplementation(method), to: SetContentOffset.self)

    let override: @convention(block) (AnyObject, CGPoint, Bool) -> Void = { object, offset, animated in
      if let scrollView = object as? UIScrollView {
        scrollView.animatedScrollTarget = animated ? offset : nil
      }
      superImplementation(object, selector, offset, animated)
    }

    class_addMethod(
      subclass,
      selector,
      imp_implementationWithBlock(override),
      method_getTypeEncoding(method)
    )
  }
}

private var animatedScrollTargetKey: UInt8 = 0

extension UIScrollView {
  /// The offset the last animated `setContentOffset` headed for. Only the
  /// pager's runtime subclass records it, see `PagerGestureObserver`.
  var animatedScrollTarget: CGPoint? {
    get { (objc_getAssociatedObject(self, &animatedScrollTargetKey) as? NSValue)?.cgPointValue }
    set {
      objc_setAssociatedObject(
        self,
        &animatedScrollTargetKey,
        newValue.map { NSValue(cgPoint: $0) },
        .OBJC_ASSOCIATION_RETAIN_NONATOMIC
      )
    }
  }
}
