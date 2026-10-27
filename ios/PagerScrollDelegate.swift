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
  /// Called once a drag has come to rest, after `TabView` has seen it.
  var onDragEnded: (() -> Void)?
  
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
    onDragEnded?()
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
    if !decelerate {
      onDragEnded?()
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

