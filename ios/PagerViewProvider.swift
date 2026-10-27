import SwiftUI
import UIKit
#if SWIFT_PACKAGE
// CocoaPods exposes React's UIView+React category and RNCPagerViewProviding.h
// implicitly (same module); SwiftPM needs the imports.
import React
import react_native_pager_view
#endif

@_cdecl("RNCPagerViewCreateProvider")
public func createPagerViewProvider(delegate: PagerViewProviderDelegate) -> UIView & RNCPagerViewProviding {
  PagerViewProvider(delegate: delegate)
}

final class PagerViewProvider: UIView, RNCPagerViewProviding {
  private weak var delegate: PagerViewProviderDelegate?
  private var hostingController: UIHostingController<PagerView>?
  private var props = PagerViewProps()

  var scrollEnabled: Bool = true {
    didSet {
      props.scrollEnabled = scrollEnabled
    }
  }

  var overdrag: Bool = false {
    didSet {
      props.overdrag = overdrag
    }
  }

  var currentPage: Int = -1 {
    didSet {
      setPage(index: currentPage, animated: false)
    }
  }
  var keyboardDismissMode: UIScrollView.KeyboardDismissMode = .none {
    didSet {
      props.keyboardDismissMode = keyboardDismissMode
    }
  }

  var layoutDirection: PagerLayoutDirection = .ltr {
    didSet {
      props.layoutDirection = layoutDirection
    }
  }
  var orientation: UICollectionView.ScrollDirection = .horizontal {
    didSet {
      props.orientation = orientation
    }
  }

  private var lastScrollPosition = -1.0

  /// The position that comes with an idle is the physical page, which a right
  /// to left layout mirrors.
  private var settledPage: Int {
    let page = Int(lastScrollPosition)
    return props.layoutDirection == .rtl
      ? props.children.count - 1 - page
      : page
  }

  /// Resigning a first responder forces a layout pass, and one inside a
  /// `TabView` animation makes SwiftUI apply the pending selection twice,
  /// landing a page past the target, so the blur waits for the pager to settle.
  private var isPageChangeAnimating = false

  /// iOS 15 pages through a scroll view inside the collection view that
  /// `PagerScrollDelegate` never sees, and visionOS never installs that
  /// delegate, so nothing reports settling there. A slide settles in about
  /// 0.8s under the default spring, and where settling is reported this is
  /// only a backstop.
  private static let pageChangeWait: TimeInterval = 1

  convenience init(delegate: PagerViewProviderDelegate) {
    self.init()
    self.delegate = delegate
  }

  /// Default mode holds this for a whole swipe: the gesture and its
  /// deceleration keep the run loop in tracking mode, so the keyboard cannot
  /// close under the finger. A timer wakes the loop. A queued block would not.
  private func schedule(_ selector: Selector, after delay: TimeInterval) {
    cancel(selector)
    perform(selector, with: nil, afterDelay: delay, inModes: [.default])
  }

  private func cancel(_ selector: Selector) {
    NSObject.cancelPreviousPerformRequests(
      withTarget: self,
      selector: selector,
      object: nil
    )
  }

  @objc private func endPageChangeWait() {
    cancel(#selector(endPageChangeWait))
    isPageChangeAnimating = false
    schedule(#selector(blurOutsideCurrentPage), after: 0)
  }

  /// The page is read when the blur fires, not when it was scheduled, so a
  /// page change arriving first decides which page keeps its input. Only a
  /// responder that takes text is resigned: a key-command view is not an input.
  @objc private func blurOutsideCurrentPage() {
    // A blur scheduled before this slide would otherwise land inside it. The
    // settling schedules another one.
    if isPageChangeAnimating {
      return
    }
    let page = props.currentPage
    guard props.children[safe: page] != nil else {
      return
    }
    // A window has one first responder, so stop at the first page holding it.
    for (index, child) in props.children.enumerated() where index != page {
      guard child.view.window != nil,
            let responder = Self.firstResponder(in: child.view) else {
        continue
      }
      if responder is UIKeyInput || responder.inputView != nil {
        responder.resignFirstResponder()
      }
      return
    }
  }

  private static func firstResponder(in view: UIView) -> UIView? {
    if view.isFirstResponder {
      return view
    }
    for subview in view.subviews {
      if let responder = firstResponder(in: subview) {
        return responder
      }
    }
    return nil
  }

  func insertChild(_ child: UIView, at index: Int) {
    guard index >= 0 && index <= props.children.count else {
      return
    }
    props.children.insert(IdentifiablePlatformView(child), at: index)
  }

  func removeChild(at index: Int) {
    guard index >= 0 && index < props.children.count else {
      return
    }
    props.children.remove(at: index)
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      setupView()
    }
  }

  override func willMove(toWindow newWindow: UIWindow?) {
    super.willMove(toWindow: newWindow)
    if newWindow != nil {
      syncParentViewController()
    } else {
      // A scheduled blur or wait retains the pager until it fires.
      cancel(#selector(blurOutsideCurrentPage))
      cancel(#selector(endPageChangeWait))
      isPageChangeAnimating = false
    }
  }

  override func willMove(toSuperview newSuperview: UIView?) {
    if let parentViewController = newSuperview?.reactViewController() {
      syncParentViewController(to: parentViewController)
    }
    super.willMove(toSuperview: newSuperview)
  }

  override func didMoveToSuperview() {
    super.didMoveToSuperview()
    syncParentViewController()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    if window != nil {
      setupView()
    }
  }

  override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    // The hosting view is forced to `.zero`, so UIKit will not forward this
    // change into `PageChildViewController`. Relayout so it can re-read our
    // insets (native search bar, keyboard, stacked header, …).
    hostingController?.view.setNeedsLayout()
  }

  func goTo(index: Int, animated: Bool) {
    if animated && hasPresentedViewController() {
      // A native-stack modal can begin its dismissal in the same JavaScript
      // callback as `setPage`. Starting a SwiftUI TabView animation in that
      // transaction makes TabView apply the selection twice, landing one page
      // too far. Let UIKit register the dismissal first, then perform the
      // pager animation after the transition has completed.
      // Native-stack may need several run-loop passes before its transition
      // coordinator becomes observable. Check briefly for that coordinator
      // instead of starting the SwiftUI animation on the very next pass.
      setPageWhenPresentationTransitionCompletes(
        index: index,
        attemptsRemaining: 10
      )
    } else {
      setPage(index: index, animated: animated)
    }
  }

  private func setPageWhenPresentationTransitionCompletes(
    index: Int,
    attemptsRemaining: Int
  ) {
    guard let transitionCoordinator = activeTransitionCoordinator() else {
      guard attemptsRemaining > 0 && hasPresentedViewController() else {
        setPage(index: index, animated: true)
        return
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + 0.01) { [weak self] in
        self?.setPageWhenPresentationTransitionCompletes(
          index: index,
          attemptsRemaining: attemptsRemaining - 1
        )
      }
      return
    }

    let didSchedulePageChange = transitionCoordinator.animate(
      alongsideTransition: nil
    ) { [weak self] _ in
      DispatchQueue.main.async {
        self?.setPage(index: index, animated: true)
      }
    }

    if !didSchedulePageChange {
      setPage(index: index, animated: true)
    }
  }

  private func setPage(index: Int, animated: Bool) {
    // Only a sliding command starts a wait, and none of them ends one that is
    // already running, so a jump landing mid-slide still waits it out.
    let willSlide =
      animated && index != props.currentPage && window != nil
        && props.children.indices.contains(index)
    if willSlide {
      isPageChangeAnimating = true
      schedule(#selector(endPageChangeWait), after: Self.pageChangeWait)
    }
    if animated {
      withAnimation {
        props.currentPage = index
      }
    } else {
      props.currentPage = index
    }
  }

  /// Finds the native-stack transition that may be dismissing a modal over
  /// this pager. The coordinator becomes available only after the imperative
  /// command has returned to the main run loop.
  private func activeTransitionCoordinator() -> UIViewControllerTransitionCoordinator? {
    var viewController = reactViewController()
    while let current = viewController {
      if let transitionCoordinator = current.transitionCoordinator {
        return transitionCoordinator
      }
      viewController = current.parent
    }

    var rootViewController = window?.rootViewController
    while let current = rootViewController {
      if let transitionCoordinator = current.transitionCoordinator {
        return transitionCoordinator
      }
      rootViewController = current.presentedViewController
    }

    return nil
  }

  private func hasPresentedViewController() -> Bool {
    var viewController = reactViewController()
    while let current = viewController {
      if current.presentedViewController != nil {
        return true
      }
      viewController = current.parent
    }
    return false
  }

  private func setupView() {
    if self.hostingController != nil {
      syncParentViewController()
      return
    }

    guard let parentViewController = reactViewController() else {
      return
    }

    // The hosting view must not carry a safe area: `PagerView`'s `GeometryReader`
    // is measured inside it, and every page is framed to that measurement, so the
    // pages end up inset by the safe area while React Native's own layout still
    // has them at full size. `PageChildViewController` reads *this* view's
    // insets (the RN screen's, including a native search bar) and re-injects
    // them; the two are independent.
    // iOS 15 only, see PagerViewIOS15NavigationBarCompat.swift
    // (delete together with the iOS 15 support).
    let hostingController = PagerViewIOS15NavigationBarCompat.makeHostingController(
      rootView: PagerView(props: props, delegate: self),
      ignoreSafeArea: true
    )
    self.hostingController = hostingController

    parentViewController.addChild(hostingController)
    hostingController.view.backgroundColor = .clear
    addSubview(hostingController.view)

    hostingController.view.translatesAutoresizingMaskIntoConstraints = false
    hostingController.view.pinEdges(to: self)

    hostingController.didMove(toParent: parentViewController)
  }

  /// SwiftUI can recreate the page controller around this React view while
  /// preserving the view itself. Keep the hosting controller attached to the
  /// current page controller so UIKit's view-controller hierarchy stays valid.
  private func syncParentViewController(to parentViewController: UIViewController? = nil) {
    guard let hostingController,
          let parentViewController = parentViewController ?? reactViewController(),
          hostingController.parent !== parentViewController else {
      return
    }

    hostingController.willMove(toParent: nil)
    hostingController.removeFromParent()
    parentViewController.addChild(hostingController)
    hostingController.didMove(toParent: parentViewController)
  }
}

extension PagerViewProvider: PagerViewProviderDelegate {
  func onPageScroll(position: Double, offset: Double) {
    delegate?.onPageScroll(position: position, offset: offset)
    lastScrollPosition = position
  }

  /// `PagerScrollDelegate` sends the settled page just before it reports idle,
  /// so an idle naming another page belongs to a slide that has been replaced.
  func onPageScrollStateChanged(state: PageScrollState) {
    delegate?.onPageScrollStateChanged(state: state)
    guard state == .idle, isPageChangeAnimating,
          settledPage == props.currentPage
    else {
      return
    }
    endPageChangeWait()
  }

  func onPageSelected(position: Int) {
    delegate?.onPageSelected(position: position)
    if isPageChangeAnimating {
      return
    }
    schedule(#selector(blurOutsideCurrentPage), after: 0)
  }
}
