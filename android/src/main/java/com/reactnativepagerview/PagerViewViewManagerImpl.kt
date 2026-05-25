package com.reactnativepagerview

object PagerViewViewManagerImpl {
    const val NAME = "RNCViewPager"

    fun addView(host: ComposePagerView, child: android.view.View?, index: Int) {
        host.addPage(child, index)
    }

    fun getChildCount(parent: ComposePagerView) = parent.getPageCount()

    fun getChildAt(parent: ComposePagerView, index: Int): android.view.View {
        return parent.getPageAt(index)
    }

    fun removeView(parent: ComposePagerView, view: android.view.View) {
        parent.removePage(view)
    }

    fun removeAllViews(parent: ComposePagerView) {
        parent.removeAllPages()
    }

    fun removeViewAt(parent: ComposePagerView, index: Int) {
        parent.removePageAt(index)
    }

    fun needsCustomLayoutForChildren(): Boolean {
        return true
    }

    fun setScrollEnabled(host: ComposePagerView, value: Boolean) {
        host.setScrollEnabled(value)
    }

    fun setLayoutDirection(host: ComposePagerView, value: String) {
        host.setLayoutDirection(value)
    }

    fun setInitialPage(host: ComposePagerView, value: Int) {
        host.setInitialPage(value)
    }

    fun setOrientation(host: ComposePagerView, value: String) {
        host.setOrientation(value)
    }

    fun setOffscreenPageLimit(host: ComposePagerView, value: Int) {
        host.setOffscreenPageLimit(value)
    }

    fun setOverScrollMode(host: ComposePagerView, value: String) {
        return
    }

    fun setPageMargin(host: ComposePagerView, margin: Int) {
        host.setPageMargin(margin)
    }
}
