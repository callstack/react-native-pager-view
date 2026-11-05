import UIKit
#if SWIFT_PACKAGE
import react_native_pager_view
#endif

/**
 Scroll delegate used to control underlying TabView's collection view. It
 pages horizontally, as the vertical pager rotates it, and on iOS 15 through
 the scroll views it embeds (see `PagerViewIOS15Compat`).
 */
class PagerScrollDelegate: NSObject, UIScrollViewDelegate, UICollectionViewDelegate {
  weak var originalDelegate: UICollectionViewDelegate?
  weak var delegate: PagerViewProviderDelegate?
  /// Called once the pager has come to rest on a page, after `TabView`'s own
  /// handler has seen the same event. The page is the physical one, which a
  /// right-to-left layout mirrors.
  var onRest: ((Int) -> Void)?
  /// Page the last rest was reported for, so a slide reports its arrival once.
  /// A scroll-end callback is the final word and reports anyway, since the page
  /// check downstream may have dropped the earlier one.
  private var lastRestedPage: Int?
  
  private let handledSelectors: Set<Selector> = [
    #selector(scrollViewDidScroll(_:)),
    #selector(scrollViewWillBeginDragging(_:)),
    #selector(scrollViewWillBeginDecelerating(_:)),
    #selector(scrollViewDidEndDecelerating(_:)),
    #selector(scrollViewDidEndScrollingAnimation(_:)),
    #selector(scrollViewDidEndDragging(_:willDecelerate:)),
    #selector(collectionView(_:didEndDisplaying:forItemAt:)),
    #selector(collectionView(_:willDisplay:forItemAt:))
  ]
  
  func scrollViewDidScroll(_ scrollView: UIScrollView) {
    let pageSize = scrollView.frame.width
    let contentOffset = scrollView.contentOffset.x

    guard pageSize > 0 else { return }
    
    let offset = contentOffset.truncatingRemainder(dividingBy: pageSize) / pageSize
    let position = Int(round(contentOffset / pageSize - offset))
    
    delegate?.onPageScroll(position: position, offset: offset)
    originalDelegate?.scrollViewDidScroll?(scrollView)
    // A slide another command redirects lands after its last scroll-end
    // callback, and that callback arrives between pages, so the offset is the
    // only report left of that landing. A finger on the pager or a
    // deceleration means it is still on its way, and both end in a callback.
    if !scrollView.isTracking, !scrollView.isDecelerating {
      notifyRestOnPageBoundary(scrollView)
    }
  }

  /// Emits a final onPageScroll with offset 0 before transitioning to idle,
  /// clearing any residual floating-point offset from the scroll animation.
  private func emitIdleWithCleanOffset(_ scrollView: UIScrollView) {
    if let (page, _) = nearestPage(in: scrollView) {
      delegate?.onPageScroll(position: page, offset: 0)
    }

    delegate?.onPageScrollStateChanged(state: .idle)
  }

  /// A slide cut short by another command stops between pages, which is not a
  /// rest: the pager is still on its way somewhere.
  private func notifyRestOnPageBoundary(_ scrollView: UIScrollView, fromScrollEnd: Bool = false) {
    guard let (page, _) = nearestPage(in: scrollView) else {
      return
    }
    guard scrollView.isOnPageBoundary else {
      lastRestedPage = nil
      return
    }
    guard fromScrollEnd || lastRestedPage != page else {
      return
    }
    lastRestedPage = page
    onRest?(page)
  }

  /// The page the scroll view is closest to and the page size it was measured
  /// against, or nil before the scroll view has a size.
  private func nearestPage(in scrollView: UIScrollView) -> (page: Int, pageSize: CGFloat)? {
    let pageSize = scrollView.frame.width
    guard pageSize > 0 else {
      return nil
    }
    return (Int(round(scrollView.contentOffset.x / pageSize)), pageSize)
  }
  
  func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
    // A drag leaves the page, so its landing is a new rest even on the same page.
    lastRestedPage = nil
    delegate?.onPageScrollStateChanged(state: .dragging)
    originalDelegate?.scrollViewWillBeginDragging?(scrollView)
  }
  
  func scrollViewWillBeginDecelerating(_ scrollView: UIScrollView) {
    delegate?.onPageScrollStateChanged(state: .settling)
    originalDelegate?.scrollViewWillBeginDecelerating?(scrollView)
  }
  
  func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
    emitIdleWithCleanOffset(scrollView)
    originalDelegate?.scrollViewDidEndDecelerating?(scrollView)
    notifyRestOnPageBoundary(scrollView, fromScrollEnd: true)
  }

  func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) {
    emitIdleWithCleanOffset(scrollView)
    originalDelegate?.scrollViewDidEndScrollingAnimation?(scrollView)
    notifyRestOnPageBoundary(scrollView, fromScrollEnd: true)
  }

  func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
    if !decelerate {
      emitIdleWithCleanOffset(scrollView)
    }
    originalDelegate?.scrollViewDidEndDragging?(scrollView, willDecelerate: decelerate)
    if !decelerate {
      notifyRestOnPageBoundary(scrollView, fromScrollEnd: true)
    }
  }
  
  func collectionView(_ collectionView: UICollectionView, didEndDisplaying cell: UICollectionViewCell, forItemAt indexPath: IndexPath) {
    originalDelegate?.collectionView?(collectionView, didEndDisplaying: cell, forItemAt: indexPath)
  }
  
  func collectionView(_ collectionView: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt indexPath: IndexPath) {
    originalDelegate?.collectionView?(collectionView, willDisplay: cell, forItemAt: indexPath)
    Self.pageController(in: cell.contentView)?.reclaimWrappedViewIfOrphaned()
  }

  private static func pageController(in view: UIView) -> PageChildViewController? {
    if let controller = view.next as? PageChildViewController {
      return controller
    }
    for subview in view.subviews {
      if let controller = pageController(in: subview) {
        return controller
      }
    }
    return nil
  }
  
  override func responds(to aSelector: Selector!) -> Bool {
    handledSelectors.contains(aSelector) || (originalDelegate?.responds(to: aSelector) ?? false)
  }
  
  override func forwardingTarget(for aSelector: Selector!) -> Any? {
    handledSelectors.contains(aSelector) ? nil : originalDelegate
  }
}

