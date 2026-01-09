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
  private var gestureObserver: NSKeyValueObservation?
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    // iOS 26+ full-screen back gesture (interactiveContentPopGestureRecognizer)
    if #available(iOS 26, *) {
      // Get the navigation controller's interactive content pop gesture recognizer
      guard let collectionView = collectionView,
            let viewController = collectionView.reactViewController(),
            let navigationController = viewController.navigationController else {
        return false
      }
      
      // iOS 26 introduces interactiveContentPopGestureRecognizer for full-screen back gestures
      // We need to check if this property exists and use it, otherwise fall back to standard behavior
      let interactiveGesture: UIGestureRecognizer?
      if let contentPopGesture = navigationController.value(forKey: "interactiveContentPopGestureRecognizer") as? UIGestureRecognizer {
        interactiveGesture = contentPopGesture
      } else {
        // Fallback to standard interactivePopGestureRecognizer
        interactiveGesture = navigationController.interactivePopGestureRecognizer
      }
      
      // Check if this is the pager's pan gesture and the other is the navigation back gesture
      if gestureRecognizer == collectionView.panGestureRecognizer,
         otherGestureRecognizer == interactiveGesture {
        
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
          
          // Observe gesture state to re-enable when gesture ends
          gestureObserver?.invalidate()
          gestureObserver = otherGestureRecognizer.observe(\.state, options: [.new]) { [weak self, weak collectionView] _, change in
            guard let self = self, 
                  let collectionView = collectionView,
                  let newState = change.newValue else { return }
            
            // Re-enable pager scroll when navigation gesture ends
            if newState == .ended || newState == .cancelled || newState == .failed {
              collectionView.panGestureRecognizer.isEnabled = self.scrollEnabled
              self.gestureObserver?.invalidate()
              self.gestureObserver = nil
            }
          }
        } else {
          collectionView.panGestureRecognizer.isEnabled = scrollEnabled
        }
        
        return true
      }
    }
    
    return false
  }
  
  deinit {
    gestureObserver?.invalidate()
  }
}
