class ViewPagerView: UIView, UIPageViewControllerDataSource, UIPageViewControllerDelegate {
    @objc var count: NSNumber = 0
    @objc var offset: NSNumber = 0
    @objc var onPageSelected: RCTBubblingEventBlock?

    private let controllerCache = NSMapTable<UIView, UIViewController>.weakToWeakObjects()
    private var currentPage = 0
    private let pageIndexes = NSMapTable<UIViewController, NSNumber>.weakToStrongObjects()
    private let pager = UIPageViewController(transitionStyle: .scroll, navigationOrientation: .horizontal)

    override init(frame: CGRect) {
        super.init(frame: frame)

        pager.dataSource = self
        pager.delegate = self
        addSubview(pager.view)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func didUpdateReactSubviews() {
        guard let controller = getControllerAtPosition(currentPage) else {
            return
        }
        // TODO: Is there a better way to invalidate placeholder views?
        pager.setViewControllers(
            [controller],
            direction: .forward,
            animated: false,
            completion: nil
        )
        pager.view.frame = self.bounds
        pager.view.layoutIfNeeded()
    }

    func pageViewController(_ pageViewController: UIPageViewController, viewControllerBefore viewController: UIViewController) -> UIViewController? {
        guard let pageIndex = pageIndexes.object(forKey: viewController) else {
            return nil
        }
        return getControllerAtPosition(Int(truncating: pageIndex) - 1)
    }

    func pageViewController(_ pageViewController: UIPageViewController, viewControllerAfter viewController: UIViewController) -> UIViewController? {
        guard let pageIndex = pageIndexes.object(forKey: viewController) else {
            return nil
        }
        return getControllerAtPosition(Int(truncating: pageIndex) + 1)
    }

    func pageViewController(_ pageViewController: UIPageViewController, didFinishAnimating finished: Bool, previousViewControllers: [UIViewController], transitionCompleted completed: Bool) {
        guard let controller = pageViewController.viewControllers?.first else {
            return
        }
        guard let pageIndex = pageIndexes.object(forKey: controller) else {
            return
        }
        currentPage = Int(truncating: pageIndex)

        if let dispatcher = onPageSelected {
            dispatcher(["page": currentPage])
        }
    }

    private func getControllerForView(_ view: UIView) -> UIViewController {
        guard let controller = controllerCache.object(forKey: view) else {
            let newController = UIViewController()
            newController.view = view
            controllerCache.setObject(newController, forKey: view)
            return newController
        }
        return controller
    }

    private func getControllerAtPosition(_ position: Int) -> UIViewController? {
        let controller: UIViewController
        if let reactView = getViewAtPosition(position) {
            controller = getControllerForView(reactView)
        } else if position >= 0 && position < Int(truncating: count) {
            // Not yet rendered? Give placeholder.
            controller = UIViewController()
        } else {
            return nil
        }

        pageIndexes.setObject(position as NSNumber, forKey: controller)
        return controller
    }

    private func getViewAtPosition(_ position: Int) -> UIView? {
        guard let reactChildrenViews = reactSubviews() else {
            return nil
        }
        let index = position - Int(truncating: offset)
        if index >= 0 && index < reactChildrenViews.count {
            return reactChildrenViews[index]
        }
        return nil
    }
}
