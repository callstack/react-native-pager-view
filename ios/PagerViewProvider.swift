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
    if animated {
      withAnimation {
        props.currentPage = index
      }
    } else {
      props.currentPage = index
    }
  }

  private func setupView() {
    if self.hostingController != nil {
      syncParentViewController()
      return
    }

    guard let parentViewController = reactViewController() else {
      return
    }

    let hostingController = UIHostingController(
      rootView: PagerView(props: props, delegate: delegate)
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
    guard let hostingController else {
      return
    }
    let parentViewController = parentViewController ?? reactViewController()
    guard hostingController.parent !== parentViewController else {
      return
    }

    hostingController.willMove(toParent: nil)
    hostingController.removeFromParent()
    if let parentViewController {
      parentViewController.addChild(hostingController)
      hostingController.didMove(toParent: parentViewController)
    }
  }
}
