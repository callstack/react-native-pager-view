import UIKit
#if SWIFT_PACKAGE
import react_native_pager_view
#endif

/**
 Scroll delegate used to control underlying TabView's collection view.
 */
class PagerScrollDelegate: NSObject, UIScrollViewDelegate, UICollectionViewDelegate {
  weak var originalDelegate: UICollectionViewDelegate?
  weak var delegate: PagerViewProviderDelegate?
  var orientation: UICollectionView.ScrollDirection = .horizontal
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
    let isHorizontal = orientation == .horizontal
    let pageSize = isHorizontal ? scrollView.frame.width : scrollView.frame.height
    let contentOffset = isHorizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y
    
    guard pageSize > 0 else { return }
    
    let offset = contentOffset.truncatingRemainder(dividingBy: pageSize) / pageSize
    let position = round(contentOffset / pageSize - offset)
    
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
    let isHorizontal = orientation == .horizontal
    let pageSize = isHorizontal ? scrollView.frame.width : scrollView.frame.height
    let contentOffset = isHorizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y

    if pageSize > 0 {
      let page = Int(round(contentOffset / pageSize))
      delegate?.onPageScroll(position: Double(page), offset: 0)
    }

    delegate?.onPageScrollStateChanged(state: .idle)
  }

  /// A slide cut short by another command stops between pages, which is not a
  /// rest: the pager is still on its way somewhere.
  private func notifyRestOnPageBoundary(_ scrollView: UIScrollView, fromScrollEnd: Bool = false) {
    let isHorizontal = orientation == .horizontal
    let pageSize = isHorizontal ? scrollView.frame.width : scrollView.frame.height
    let contentOffset = isHorizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y

    guard pageSize > 0 else {
      return
    }
    let offsetInPage = abs(contentOffset.truncatingRemainder(dividingBy: pageSize))
    guard offsetInPage < 1 || pageSize - offsetInPage < 1 else {
      lastRestedPage = nil
      return
    }
    let page = Int(round(contentOffset / pageSize))
    guard fromScrollEnd || lastRestedPage != page else {
      return
    }
    lastRestedPage = page
    onRest?(page)
  }
  
  func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
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
  }
  
  override func responds(to aSelector: Selector!) -> Bool {
    handledSelectors.contains(aSelector) || (originalDelegate?.responds(to: aSelector) ?? false)
  }
  
  override func forwardingTarget(for aSelector: Selector!) -> Any? {
    handledSelectors.contains(aSelector) ? nil : originalDelegate
  }
}

