import UIKit

/// iOS 15 only, see `PagerViewIOS15Compat`. Delete once the minimum supported iOS version is 16.
///
/// The scroll views that page on iOS 15 only exist once the collection view displays its pages, so
/// a `PagerScrollDelegate` is attached to them from here.
final class PagerScrollDelegateIOS15: PagerScrollDelegate {
  override func collectionView(
    _ collectionView: UICollectionView,
    willDisplay cell: UICollectionViewCell,
    forItemAt indexPath: IndexPath
  ) {
    PagerViewIOS15Compat.attachScrollDelegate(to: collectionView, delegate: delegate)
    super.collectionView(collectionView, willDisplay: cell, forItemAt: indexPath)
  }
}
