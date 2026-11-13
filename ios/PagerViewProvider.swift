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
      props.currentPage = currentPage
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

  convenience init(delegate: PagerViewProviderDelegate) {
    self.init()
    self.delegate = delegate
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
    } else {
      syncParentViewController(to: nil)
    }
  }

  override func willMove(toWindow newWindow: UIWindow?) {
    super.willMove(toWindow: newWindow)
    if newWindow != nil {
      syncParentViewController(to: reactViewController())
    }
  }

  override func willMove(toSuperview newSuperview: UIView?) {
    syncParentViewController(to: newSuperview?.reactViewController())
    super.willMove(toSuperview: newSuperview)
  }

  override func didMoveToSuperview() {
    super.didMoveToSuperview()
    syncParentViewController(to: reactViewController())
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

  func goTo(index: Int, animation: PagerPageAnimation) {
    if animation != .none && hasPresentedViewController() {
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
        animation: animation,
        attemptsRemaining: 10
      )
    } else {
      setPage(index: index, animation: animation)
    }
  }

  private func setPageWhenPresentationTransitionCompletes(
    index: Int,
    animation: PagerPageAnimation,
    attemptsRemaining: Int
  ) {
    guard let transitionCoordinator = activeTransitionCoordinator() else {
      guard attemptsRemaining > 0 && hasPresentedViewController() else {
        setPage(index: index, animation: animation)
        return
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + 0.01) { [weak self] in
        self?.setPageWhenPresentationTransitionCompletes(
          index: index,
          animation: animation,
          attemptsRemaining: attemptsRemaining - 1
        )
      }
      return
    }

    let didSchedulePageChange = transitionCoordinator.animate(
      alongsideTransition: nil
    ) { [weak self] _ in
      DispatchQueue.main.async {
        self?.setPage(index: index, animation: animation)
      }
    }

    if !didSchedulePageChange {
      setPage(index: index, animation: animation)
    }
  }

  private func setPage(index: Int, animation: PagerPageAnimation) {
    guard props.children.indices.contains(index) else {
      return
    }
    // Blur before the selection changes: resigning during the TabView
    // animation breaks the slide. A command for the page already shown moves
    // nothing, and blurring on it would close the keyboard during a swipe an
    // app echoes back with `setPage`.
    if index != props.currentPage {
      props.resignFirstResponder(outsidePage: index)
    }
    let previousPage = props.currentPage
    if index != previousPage {
      props.stopSlideBeforeSelectionChange()
    }
    // Setting a published value updates the view even when it is already nil,
    // and an update outside the animation would cut a running slide short.
    let previousTransition = props.pageTransition
    if let previousTransition {
      props.pageTransition = nil
      // The jump to the passing page reported no selection.
      if !previousTransition.isSliding && index == props.currentPage {
        delegate?.onPageSelected(position: index)
      }
    }
    switch animation {
    case .none:
      props.currentPage = index
    case .scroll:
      withAnimation {
        props.currentPage = index
      }
    case .direct:
      slideDirectly(to: index, after: previousTransition)
    }
    // Only a plain selection change can be skipped by TabView: a two-step
    // direct slide starts its animation from `PagerView.slide`. Checked on the
    // next pass, once the commands sent together have settled the selection.
    if props.pageTransition == nil && props.currentPage != previousPage {
      DispatchQueue.main.async { [props] in
        props.scrollToSelectionSkippedMidSlide(index, animated: animation != .none)
      }
    }
  }

  /// Jumps to the target's neighbour, moving the current page into it, so only
  /// the target slides in; `PagerView` starts the slide. iOS 15 scrolls instead,
  /// as it reports no rest to put the page back, see `PagerViewIOS15Compat`.
  private func slideDirectly(to index: Int, after previousTransition: PageTransition?) {
    let currentPage = props.currentPage
    guard #available(iOS 16, *),
          abs(index - currentPage) > 1,
          props.children.indices.contains(currentPage) else {
      withAnimation {
        props.currentPage = index
      }
      return
    }
    // A slide redirected before it moved still shows the page it left.
    let shownPage = previousTransition
      .flatMap { !$0.isSliding && $0.passingPage == currentPage ? $0.leftPage : nil }
      ?? props.children[currentPage].view
    // The target slot would give that page up.
    if shownPage === props.children[index].view {
      props.currentPage = index
      return
    }
    let transition = PageTransition(
      passingPage: index > currentPage ? index - 1 : index + 1,
      targetPage: index,
      leftPage: shownPage
    )
    props.pageTransition = transition
    props.currentPage = transition.passingPage
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
      syncParentViewController(to: reactViewController())
      return
    }

    // Window-level containers, such as FullWindowOverlay, do not have a
    // controller in their responder chain. The hosting view can still render
    // there, but must not be attached to an unrelated controller.
    let parentViewController = reactViewController()

    // The hosting view must not carry a safe area: `PagerView`'s `GeometryReader`
    // is measured inside it, and every page is framed to that measurement, so the
    // pages end up inset by the safe area while React Native's own layout still
    // has them at full size. `PageChildViewController` reads *this* view's
    // insets (the RN screen's, including a native search bar) and re-injects
    // them; the two are independent.
    // iOS 15 only, see PagerViewIOS15NavigationBarCompat.swift
    // (delete together with the iOS 15 support).
    let hostingController = PagerViewIOS15NavigationBarCompat.makeHostingController(
      rootView: PagerView(props: props, delegate: delegate),
      ignoreSafeArea: true
    )
    self.hostingController = hostingController

    parentViewController?.addChild(hostingController)
    hostingController.view.backgroundColor = .clear
    addSubview(hostingController.view)

    hostingController.view.translatesAutoresizingMaskIntoConstraints = false
    hostingController.view.pinEdges(to: self)

    hostingController.didMove(toParent: parentViewController)
  }

  /// SwiftUI can recreate the page controller around this React view while
  /// preserving the view itself. Keep the hosting controller attached to the
  /// current page controller so UIKit's view-controller hierarchy stays valid.
  private func syncParentViewController(to parentViewController: UIViewController?) {
    guard let hostingController,
          hostingController.parent !== parentViewController else {
      return
    }

    hostingController.willMove(toParent: nil)
    hostingController.removeFromParent()
    parentViewController?.addChild(hostingController)
    hostingController.didMove(toParent: parentViewController)
  }
}
