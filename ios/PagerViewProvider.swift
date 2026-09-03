import SwiftUI
import UIKit

@objc public enum PageScrollState: Int {
  case idle
  case dragging
  case settling
}

@objcMembers public class OnPageScrollEventData: NSObject {
  public let position: Double
  public let offset: Double

  init(position: Double, offset: Double) {
    self.position = position
    self.offset = offset
    super.init()
  }
}

@objc public protocol PagerViewProviderDelegate {
  func onPageScroll(data: OnPageScrollEventData)
  func onPageScrollStateChanged(state: PageScrollState)
  func onPageSelected(position: Int)
}

@objc public class PagerViewProvider: UIView {
  private weak var delegate: PagerViewProviderDelegate?
  private var hostingController: UIHostingController<PagerView>?
  private var props = PagerViewProps()

  @objc public var scrollEnabled: Bool = true {
    didSet {
      props.scrollEnabled = scrollEnabled
    }
  }

  @objc public var overdrag: Bool = false {
    didSet {
      props.overdrag = overdrag
    }
  }

  @objc public var currentPage: Int = -1 {
    didSet {
      props.currentPage = currentPage
    }
  }
  @objc public var keyboardDismissMode: UIScrollView.KeyboardDismissMode = .none {
    didSet {
      props.keyboardDismissMode = keyboardDismissMode
    }
  }

  @objc public var layoutDirection: PagerLayoutDirection = .ltr {
    didSet {
      props.layoutDirection = layoutDirection
    }
  }
  @objc public var orientation: UICollectionView.ScrollDirection = .horizontal {
    didSet {
      props.orientation = orientation
    }
  }

  @objc public convenience init(delegate: PagerViewProviderDelegate) {
    self.init()
    self.delegate = delegate
  }

  @objc(insertChild:atIndex:)
  public func insertChild(_ child: UIView, at index: Int) {
    guard index >= 0 && index <= props.children.count else {
      return
    }
    props.children.insert(IdentifiablePlatformView(child), at: index)
  }

  @objc(removeChildAtIndex:)
  public func removeChild(at index: Int) {
    guard index >= 0 && index < props.children.count else {
      return
    }
    props.children.remove(at: index)
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      setupView()
    }
  }

  override public func willMove(toWindow newWindow: UIWindow?) {
    super.willMove(toWindow: newWindow)
    if newWindow != nil {
      syncParentViewController()
    }
  }

  override public func willMove(toSuperview newSuperview: UIView?) {
    if let parentViewController = newSuperview?.reactViewController() {
      syncParentViewController(to: parentViewController)
    }
    super.willMove(toSuperview: newSuperview)
  }

  override public func didMoveToSuperview() {
    super.didMoveToSuperview()
    syncParentViewController()
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    if window != nil {
      setupView()
    }
  }

  @objc public func goTo(index: Int, animated: Bool) {
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
    // has them at full size. `propagateSafeArea()` on `PageChildViewController`
    // is what gives child UIKit views their insets back; the two are independent.
    let hostingController = UIHostingController(
      rootView: PagerView(props: props, delegate: delegate),
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
