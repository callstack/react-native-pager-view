import UIKit

/**
 Scroll delegate used to control underlying TabView's collection view.
 */
class PagerScrollDelegate: NSObject, UIScrollViewDelegate, UICollectionViewDelegate {
  weak var originalDelegate: UICollectionViewDelegate? {
    didSet {
      // Never proxy to ourselves: that makes `responds(to:)` recurse forever.
      if originalDelegate === self { originalDelegate = nil }
    }
  }
  weak var delegate: PagerViewProviderDelegate?
  var orientation: UICollectionView.ScrollDirection = .horizontal
  
  /// The collection view we already installed ourselves into. Identity, not
  /// `originalDelegate == nil`, is what tells us the install already ran:
  /// `originalDelegate` is weak and can go nil on its own.
  weak var installedCollectionView: UICollectionView?
  
  private var isQueryingOriginalDelegate = false
  
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
    if handledSelectors.contains(aSelector) { return true }
  
    // An analytics SDK may swizzle the collection view's delegate setter and
    // insert a proxy that forwards `responds(to:)` back to whatever it
    // replaced - this object. Querying `originalDelegate` then re-enters this
    // method through that proxy and overflows the stack. Report `false` for a
    // re-entrant query so the loop terminates; UIKit skips optional delegate
    // methods that answer `false`. Delegate callbacks are main-thread only.
    guard !isQueryingOriginalDelegate else { return false }
    isQueryingOriginalDelegate = true
    defer { isQueryingOriginalDelegate = false }
  
    return originalDelegate?.responds(to: aSelector) ?? false
  }
  
  override func forwardingTarget(for aSelector: Selector!) -> Any? {
    guard !handledSelectors.contains(aSelector) else { return nil }
    let target = originalDelegate
    return target === self ? nil : target
  }
}

