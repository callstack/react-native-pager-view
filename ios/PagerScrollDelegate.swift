import UIKit
#if SWIFT_PACKAGE
import react_native_pager_view
#endif

/**
 Scroll delegate used to control underlying TabView's collection view. It
 pages horizontally, as the vertical pager rotates it, and on iOS 15 through
 the scroll views it embeds (see `PagerViewIOS15Compat`).
 */
class PagerScrollDelegate: NSObject, UIScrollViewDelegate, UICollectionViewDelegate {
  weak var originalDelegate: UICollectionViewDelegate?
  weak var delegate: PagerViewProviderDelegate?
  /// Called once the pager has come to rest on a page, after `TabView`'s own
  /// handler has seen the same event. The page is the physical one, which a
  /// right-to-left layout mirrors.
  var onRest: ((Int) -> Void)?
  /// The page the selection names, counted physically, so a slide that ends
  /// between pages has somewhere to go.
  var selectedPage: (() -> Int)?
  /// The watch on a slide that ended between pages, while one runs.
  private var strandWatch: StrandWatch?
  /// Set while the idle report of a slide that ended between pages is held
  /// back, and cleared by the next idle report that goes out.
  private var isIdleOwed = false
  /// Snaps started since the pager last reported idle. A snap interrupted
  /// between pages reports a scroll end of its own and starts another watch,
  /// so counting per watch would never bound a snap that keeps missing.
  private var strandSnaps = 0
  /// Page the last rest was reported for, so a slide reports its arrival once.
  /// A scroll-end callback is the final word and reports anyway, since the page
  /// check downstream may have dropped the earlier one.
  private var lastRestedPage: Int?
  
  deinit {
    strandWatch?.stop()
    emitIdleIfOwed(nil)
  }

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
    let pageSize = scrollView.frame.width
    let contentOffset = scrollView.contentOffset.x

    guard pageSize > 0 else { return }
    
    let offset = contentOffset.truncatingRemainder(dividingBy: pageSize) / pageSize
    let position = Int(round(contentOffset / pageSize - offset))
    
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

  /// Reports idle. With `cleanOffset`, a final onPageScroll with offset 0 goes
  /// first, clearing any residual floating-point offset from the scroll
  /// animation.
  private func emitIdle(_ scrollView: UIScrollView?, cleanOffset: Bool) {
    if cleanOffset, let scrollView, let (page, _) = nearestPage(in: scrollView) {
      delegate?.onPageScroll(position: page, offset: 0)
    }

    delegate?.onPageScrollStateChanged(state: .idle)
    isIdleOwed = false
    strandSnaps = 0
  }

  /// Sends the idle report held back for a slide that ended between pages,
  /// with a clean offset only when the pager is on a page.
  private func emitIdleIfOwed(_ scrollView: UIScrollView?) {
    guard isIdleOwed else {
      return
    }
    emitIdle(scrollView, cleanOffset: scrollView.map(isOnPage) ?? false)
  }

  /// A slide cut short by another command stops between pages, which is not a
  /// rest: the pager is still on its way somewhere.
  private func notifyRestOnPageBoundary(_ scrollView: UIScrollView, fromScrollEnd: Bool = false) {
    guard let (page, pageSize) = nearestPage(in: scrollView) else {
      return
    }
    guard isOnPageBoundary(scrollView, pageSize: pageSize) else {
      lastRestedPage = nil
      return
    }
    guard fromScrollEnd || lastRestedPage != page else {
      return
    }
    lastRestedPage = page
    onRest?(page)
  }

  /// Whether the pager sits on a page, which it cannot before it has a size.
  private func isOnPage(_ scrollView: UIScrollView) -> Bool {
    guard let (_, pageSize) = nearestPage(in: scrollView) else {
      return false
    }
    return isOnPageBoundary(scrollView, pageSize: pageSize)
  }

  /// Whether the pager sits on a page rather than between two, within the
  /// rounding a scroll animation leaves behind.
  private func isOnPageBoundary(_ scrollView: UIScrollView, pageSize: CGFloat) -> Bool {
    let offsetInPage = abs(scrollView.contentOffset.x.truncatingRemainder(dividingBy: pageSize))
    return offsetInPage < 1 || pageSize - offsetInPage < 1
  }

  /// The page the scroll view is closest to and the page size it was measured
  /// against, or nil before the scroll view has a size.
  private func nearestPage(in scrollView: UIScrollView) -> (page: Int, pageSize: CGFloat)? {
    let pageSize = scrollView.frame.width
    guard pageSize > 0 else {
      return nil
    }
    return (Int(round(scrollView.contentOffset.x / pageSize)), pageSize)
  }
  
  func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
    // The drag takes the pager over, and reports idle itself when it ends.
    stopWatchingForStrand()
    isIdleOwed = false
    strandSnaps = 0
    delegate?.onPageScrollStateChanged(state: .dragging)
    originalDelegate?.scrollViewWillBeginDragging?(scrollView)
  }
  
  func scrollViewWillBeginDecelerating(_ scrollView: UIScrollView) {
    delegate?.onPageScrollStateChanged(state: .settling)
    originalDelegate?.scrollViewWillBeginDecelerating?(scrollView)
  }
  
  func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
    emitIdle(scrollView, cleanOffset: true)
    originalDelegate?.scrollViewDidEndDecelerating?(scrollView)
    notifyRestOnPageBoundary(scrollView, fromScrollEnd: true)
  }

  func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) {
    // A slide that ends between pages has not come to rest, so its idle waits
    // for the watch that follows it.
    if watchIfStranded(scrollView) {
      isIdleOwed = true
    } else {
      emitIdle(scrollView, cleanOffset: true)
    }
    originalDelegate?.scrollViewDidEndScrollingAnimation?(scrollView)
    notifyRestOnPageBoundary(scrollView, fromScrollEnd: true)
  }

  /// A slide that ends between pages has not arrived. `TabView` reports a
  /// callback there for a redirected slide and carries on, so a strand is
  /// only told apart by the pager holding still, counted in frames rather
  /// than time: a stalled main thread holds back the next frame of a slide
  /// that is still coming. The frame count is also what releases an idle held
  /// back for such a slide, so the watch runs even where the reveal override
  /// in `PagerGestureObserver` has already prevented the strand.
  /// Reports whether a watch started.
  private func watchIfStranded(_ scrollView: UIScrollView) -> Bool {
    stopWatchingForStrand()
    // Without a selection there is nowhere to move the pager to.
    guard selectedPage != nil,
          let (_, pageSize) = nearestPage(in: scrollView),
          !isOnPageBoundary(scrollView, pageSize: pageSize) else {
      return false
    }
    strandWatch = StrandWatch(owner: self, scrollView: scrollView)
    return true
  }

  /// Every way a watch ends sends the idle report it may hold back, except a
  /// drag, which sends its own.
  fileprivate func watchForStrand(_ watch: StrandWatch) {
    guard let scrollView = watch.scrollView else {
      stopWatchingForStrand()
      emitIdleIfOwed(nil)
      return
    }
    // A finger that holds the pager without dragging it stops the clock, so
    // the watch outlasts the touch.
    if !scrollView.isTracking {
      watch.frames += 1
    }
    // A pager that moves, or that a finger holds, is not stranded yet.
    if scrollView.contentOffset.x != watch.offset
        || scrollView.isTracking
        || scrollView.isDecelerating {
      watch.offset = scrollView.contentOffset.x
      watch.stillFrames = 0
    } else {
      watch.stillFrames += 1
    }
    if watch.stillFrames >= Self.strandedFrameCount {
      if strandSnaps < Self.strandSnapLimit, snapToSelection(scrollView) {
        // The snap ends in a callback of its own. The watch stays on, with
        // the limit again, in case it does not, as when the pager leaves the
        // window on the way. Only a few of those, so a snap that never
        // reaches the page it aims at cannot keep the watch alive.
        strandSnaps += 1
        watch.offset = scrollView.contentOffset.x
        watch.stillFrames = 0
        watch.frames = 0
        return
      }
      // Either the pager is on a page, which the slide reached without a
      // callback of its own, or the snaps are spent and it is not arriving.
      stopWatchingForStrand()
      emitIdleIfOwed(scrollView)
    } else if watch.frames >= Self.strandWatchFrameLimit {
      stopWatchingForStrand()
      emitIdleIfOwed(scrollView)
    }
  }

  /// Moves a pager that came to rest between pages onto the selected page,
  /// and returns whether it did.
  private func snapToSelection(_ scrollView: UIScrollView) -> Bool {
    guard let (_, pageSize) = nearestPage(in: scrollView),
          !isOnPageBoundary(scrollView, pageSize: pageSize),
          let page = selectedPage?() else {
      return false
    }
    // Out of the window there is no one to see an animation.
    scrollView.setContentOffset(
      CGPoint(x: CGFloat(page) * pageSize, y: scrollView.contentOffset.y),
      animated: scrollView.window != nil
    )
    return true
  }

  private func stopWatchingForStrand() {
    strandWatch?.stop()
    strandWatch = nil
  }

  /// Long enough for a redirected slide to carry on from a callback it
  /// reported between pages.
  private static let strandedFrameCount = 9
  /// How long a slide that ended between pages is followed before the pager
  /// is left to whatever moves it next.
  private static let strandWatchFrameLimit = 120
  /// How many snaps are started between one idle report and the next, before
  /// the pager is left to whatever moves it next.
  private static let strandSnapLimit = 3

  func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
    if !decelerate {
      emitIdle(scrollView, cleanOffset: true)
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
    Self.pageController(in: cell.contentView)?.reclaimWrappedViewIfOrphaned()
  }

  private static func pageController(in view: UIView) -> PageChildViewController? {
    if let controller = view.next as? PageChildViewController {
      return controller
    }
    for subview in view.subviews {
      if let controller = pageController(in: subview) {
        return controller
      }
    }
    return nil
  }
  
  override func responds(to aSelector: Selector!) -> Bool {
    handledSelectors.contains(aSelector) || (originalDelegate?.responds(to: aSelector) ?? false)
  }
  
  override func forwardingTarget(for aSelector: Selector!) -> Any? {
    handledSelectors.contains(aSelector) ? nil : originalDelegate
  }
}

/// One watch on a pager that came to rest between pages: what it has seen so
/// far, and the target of its display link. A display link holds its target
/// until it is invalidated, so the delegate is held weakly here, and a watch
/// left running cannot keep it alive.
private final class StrandWatch: NSObject {
  private weak var owner: PagerScrollDelegate?
  weak var scrollView: UIScrollView?
  /// The offset at the last frame, which tells a still frame from a moving one.
  var offset: CGFloat
  /// Frames in a row the pager has held still.
  var stillFrames = 0
  /// Frames counted toward the limit.
  var frames = 0
  private var link: CADisplayLink?

  init(owner: PagerScrollDelegate, scrollView: UIScrollView) {
    self.owner = owner
    self.scrollView = scrollView
    offset = scrollView.contentOffset.x
    super.init()
    let link = CADisplayLink(target: self, selector: #selector(tick))
    // A fixed rate, so the counts mean the same on a ProMotion display.
    link.preferredFramesPerSecond = 60
    link.add(to: .main, forMode: .common)
    self.link = link
  }

  func stop() {
    link?.invalidate()
    link = nil
  }

  @objc private func tick() {
    guard let owner else {
      stop()
      return
    }
    owner.watchForStrand(self)
  }
}
