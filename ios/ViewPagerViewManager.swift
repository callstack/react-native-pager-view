@objc(ViewPagerViewManager)
class ViewPagerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }

    override func view() -> UIView! {
        return ViewPagerView()
    }
}
