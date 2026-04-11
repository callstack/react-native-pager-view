import UIKit

/**
 Scroll delegate used to control underlying TabView's collection view.
 */
class PagerScrollDelegate: NSObject, UIScrollViewDelegate, UICollectionViewDelegate {
  weak var originalDelegate: UICollectionViewDelegate?
  weak var delegate: PagerViewProviderDelegate?
  var orientation: UICollectionView.ScrollDirection = .horizontal
  
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
    
    let eventData = OnPageScrollEventData(position: position, offset: offset)
    delegate?.onPageScroll(data: eventData)
    originalDelegate?.scrollViewDidScroll?(scrollView)
  }

  /// Emits a final onPageScroll with offset 0 before transitioning to idle,
  /// clearing any residual floating-point offset from the scroll animation.
  private func emitIdleWithCleanOffset(_ scrollView: UIScrollView) {
    let isHorizontal = orientation == .horizontal
    let pageSize = isHorizontal ? scrollView.frame.width : scrollView.frame.height
    let contentOffset = isHorizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y

    if pageSize > 0 {
      let page = Int(round(contentOffset / pageSize))
      let eventData = OnPageScrollEventData(position: Double(page), offset: 0)
      delegate?.onPageScroll(data: eventData)
    }

    delegate?.onPageScrollStateChanged(state: .idle)
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
  }

  func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) {
    emitIdleWithCleanOffset(scrollView)
    originalDelegate?.scrollViewDidEndScrollingAnimation?(scrollView)
  }

  func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
    if !decelerate {
      emitIdleWithCleanOffset(scrollView)
    }
    originalDelegate?.scrollViewDidEndDragging?(scrollView, willDecelerate: decelerate)
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

