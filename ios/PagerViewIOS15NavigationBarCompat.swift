import SwiftUI
import UIKit

/// Workaround for SwiftUI re-showing an intentionally hidden `UINavigationBar` on iOS 15.
///
/// On iOS 15 `UIHostingController` installs SwiftUI's `UIKitNavigationBarBridge`, which calls
/// `-[UINavigationController setNavigationBarHidden:NO]` on the enclosing navigation controller
/// whenever the hosting view appears. When that bar is deliberately hidden — for example the
/// `RNSContainerNavigationController` that `react-native-screens` creates for `hasTwoStates`
/// tab/drawer containers — the bridge re-shows an empty `UINavigationBar` that then swallows
/// touches meant for the React Native views underneath (in this case the JS header buttons).
///
/// A navigation bar that is already visible is left untouched, so native headers keep working.
///
/// On iOS 16 and later SwiftUI no longer re-shows the bar, so a plain `UIHostingController` is
/// returned and none of the code below runs.
///
/// - Note: Delete this file together with the single `PagerViewIOS15NavigationBarCompat` call in
///   `PagerViewProvider.swift` (and its entry in `Package.swift`) once the minimum supported iOS
///   version is 16.
enum PagerViewIOS15NavigationBarCompat {
  /// Returns a hosting controller that keeps the enclosing navigation bar's hidden state across
  /// the appearance callbacks on iOS 15, and a plain `UIHostingController` on iOS 16+.
  static func makeHostingController<Content: View>(
    rootView: Content,
    ignoreSafeArea: Bool
  ) -> UIHostingController<Content> {
    if #available(iOS 16, *) {
      return UIHostingController(rootView: rootView, ignoreSafeArea: ignoreSafeArea)
    }

    let hostingController = PreservingNavigationBarHostingController(rootView: rootView)
    if ignoreSafeArea {
      hostingController.disableSafeArea()
    }

    return hostingController
  }
}

/// `UIHostingController` that restores the enclosing navigation bar's hidden state around
/// `viewWillAppear`, see `PagerViewIOS15NavigationBarCompat`.
private final class PreservingNavigationBarHostingController<Content: View>: UIHostingController<Content> {
  override func viewWillAppear(_ animated: Bool) {
    let navigationController = enclosingNavigationController
    let wasNavigationBarHidden = navigationController?.isNavigationBarHidden == true
    super.viewWillAppear(animated)
    if wasNavigationBarHidden {
      navigationController?.setNavigationBarHidden(true, animated: false)
    }
  }

  private var enclosingNavigationController: UINavigationController? {
    if let navigationController {
      return navigationController
    }

    var viewController: UIViewController? = self
    while let current = viewController {
      if let navigationController = current as? UINavigationController {
        return navigationController
      }
      viewController = current.parent
    }

    return nil
  }
}
