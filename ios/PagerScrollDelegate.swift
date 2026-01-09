import UIKit

/**
 Scroll delegate used to control underlying TabView's collection view.
 */
class PagerScrollDelegate: NSObject, UIScrollViewDelegate, UICollectionViewDelegate, UIGestureRecognizerDelegate {
  weak var originalDelegate: UICollectionViewDelegate?
  weak var delegate: PagerViewProviderDelegate?
  var orientation: UICollectionView.ScrollDirection = .horizontal
  weak var collectionView: UICollectionView?
  var currentPage: Int = 0
  var layoutDirection: PagerLayoutDirection = .ltr
  var scrollEnabled: Bool = true
  
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
  
  func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
    delegate?.onPageScrollStateChanged(state: .dragging)
    originalDelegate?.scrollViewWillBeginDragging?(scrollView)
  }
  
  func scrollViewWillBeginDecelerating(_ scrollView: UIScrollView) {
    delegate?.onPageScrollStateChanged(state: .settling)
    originalDelegate?.scrollViewWillBeginDecelerating?(scrollView)
  }
  
  func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
    delegate?.onPageScrollStateChanged(state: .idle)
    // Re-enable pan gesture recognizer after decelerating ends
    if let collectionView = collectionView, !collectionView.panGestureRecognizer.isEnabled {
      collectionView.panGestureRecognizer.isEnabled = scrollEnabled
    }
    originalDelegate?.scrollViewDidEndDecelerating?(scrollView)
  }
  
  func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) {
    delegate?.onPageScrollStateChanged(state: .idle)
    originalDelegate?.scrollViewDidEndScrollingAnimation?(scrollView)
  }
  
  func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
    if !decelerate {
      delegate?.onPageScrollStateChanged(state: .idle)
    }
    // Re-enable pan gesture recognizer after dragging ends
    if let collectionView = collectionView, !collectionView.panGestureRecognizer.isEnabled {
      collectionView.panGestureRecognizer.isEnabled = scrollEnabled
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
  
  // MARK: - UIGestureRecognizerDelegate
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    // iOS 26+ full-screen back gesture (interactiveContentPopGestureRecognizer)
    if #available(iOS 18.2, *) {
      guard let collectionView = collectionView,
            let viewController = collectionView.next as? UIViewController,
            let navigationController = viewController.navigationController else {
        return false
      }
      
      // Check if otherGestureRecognizer is the new iOS 26 interactiveContentPopGestureRecognizer
      // Since iOS 26 (18.2) introduces this new gesture recognizer
      if gestureRecognizer == collectionView.panGestureRecognizer,
         otherGestureRecognizer == navigationController.interactivePopGestureRecognizer ||
         (navigationController.responds(to: Selector(("interactiveContentPopGestureRecognizer"))) &&
          otherGestureRecognizer == navigationController.value(forKey: "interactiveContentPopGestureRecognizer") as? UIGestureRecognizer) {
        
        guard let panGestureRecognizer = gestureRecognizer as? UIPanGestureRecognizer else {
          return false
        }
        
        let velocity = panGestureRecognizer.velocity(in: collectionView)
        let isLTR = layoutDirection == .ltr
        let isBackGesture = (isLTR && velocity.x > 0) || (!isLTR && velocity.x < 0)
        
        if currentPage == 0 && isBackGesture {
          collectionView.panGestureRecognizer.isEnabled = false
        } else {
          collectionView.panGestureRecognizer.isEnabled = scrollEnabled
        }
        
        return true
      }
    }
    
    return false
  }
}

