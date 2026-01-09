import UIKit

/**
 Gesture recognizer delegate to handle iOS 26+ interactiveContentPopGestureRecognizer.
 Allows navigation back gesture on first page while preserving pager functionality.
 */
class PagerGestureDelegate: NSObject, UIGestureRecognizerDelegate {
  weak var collectionView: UICollectionView?
  var currentPage: Int = 0
  var scrollEnabled: Bool = true
  var layoutDirection: PagerLayoutDirection = .ltr
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    // iOS 26+ full-screen back gesture (interactiveContentPopGestureRecognizer)
    if #available(iOS 26, *) {
      // Get the navigation controller's interactive content pop gesture recognizer
      guard let collectionView = collectionView,
            let viewController = collectionView.reactViewController(),
            let navigationController = viewController.navigationController else {
        return false
      }
      
      // Check if this is the pager's pan gesture and the other is the navigation back gesture
      if gestureRecognizer == collectionView.panGestureRecognizer,
         otherGestureRecognizer == navigationController.interactiveContentPopGestureRecognizer {
        
        // Get velocity to determine swipe direction
        guard let panGestureRecognizer = gestureRecognizer as? UIPanGestureRecognizer else {
          return false
        }
        
        let velocity = panGestureRecognizer.velocity(in: collectionView)
        let isLTR = layoutDirection == .ltr
        let isBackGesture = (isLTR && velocity.x > 0) || (!isLTR && velocity.x < 0)
        
        // If on first page and performing back gesture, disable pager scroll to allow navigation
        if currentPage == 0 && isBackGesture {
          collectionView.panGestureRecognizer.isEnabled = false
          
          // Re-enable after gesture ends to restore normal behavior
          DispatchQueue.main.async { [weak self, weak collectionView] in
            guard let self = self, let collectionView = collectionView else { return }
            collectionView.panGestureRecognizer.isEnabled = self.scrollEnabled
          }
        } else {
          collectionView.panGestureRecognizer.isEnabled = scrollEnabled
        }
        
        return true
      }
    }
    
    return false
  }
}
