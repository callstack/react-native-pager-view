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
      return
    }

    self.hostingController = UIHostingController(
      rootView: PagerView(props: props, delegate: delegate),
      ignoreSafeArea: true
    )
    if let hostingController, let parentViewController = reactViewController() {
      parentViewController.addChild(hostingController)
      hostingController.view.backgroundColor = .clear
      addSubview(hostingController.view)

      hostingController.view.translatesAutoresizingMaskIntoConstraints = false
      hostingController.view.pinEdges(to: self)

      hostingController.didMove(toParent: parentViewController)
    }
  }
}
