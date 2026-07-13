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
    // Get the navigation controller
    guard let collectionView = collectionView,
          let viewController = collectionView.reactViewController(),
          let navigationController = viewController.navigationController else {
      return false
    }
    
    // Check if this is the pager's pan gesture
    guard gestureRecognizer == collectionView.panGestureRecognizer else {
      return false
    }
    
    // Determine which navigation gesture recognizer to check
    var navGestureRecognizer: UIGestureRecognizer? = navigationController.interactivePopGestureRecognizer
    
    // iOS 26+ introduces interactiveContentPopGestureRecognizer for full-screen back gestures
    if #available(iOS 26, *) {
      // Try to access the new property safely using selector
      let selector = NSSelectorFromString("interactiveContentPopGestureRecognizer")
      if navigationController.responds(to: selector),
         let contentPopGesture = navigationController.perform(selector)?.takeUnretainedValue() as? UIGestureRecognizer {
        navGestureRecognizer = contentPopGesture
      }
    }
    
    // Check if the other gesture is the navigation back gesture
    guard let navGesture = navGestureRecognizer,
          otherGestureRecognizer == navGesture else {
      return false
    }
    
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
          // Ensure UIKit updates happen on main queue
          DispatchQueue.main.async {
            collectionView.panGestureRecognizer.isEnabled = self.scrollEnabled
          }
          self.gestureObserver?.invalidate()
          self.gestureObserver = nil
        }
      }
    } else {
      collectionView.panGestureRecognizer.isEnabled = scrollEnabled
    }
    
    return true
  }
  
  deinit {
    gestureObserver?.invalidate()
  }
}
