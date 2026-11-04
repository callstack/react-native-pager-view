package com.reactnativepagerview

import android.view.View
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNCViewPagerManagerDelegate
import com.facebook.react.viewmanagers.RNCViewPagerManagerInterface
import com.reactnativepagerview.event.PageScrollEvent
import com.reactnativepagerview.event.PageScrollStateChangedEvent
import com.reactnativepagerview.event.PageSelectedEvent


@ReactModule(name = PagerViewViewManager.NAME)
class PagerViewViewManager : ViewGroupManager<ComposePagerView>(), RNCViewPagerManagerInterface<ComposePagerView> {
    companion object {
        const val NAME = "RNCViewPager"
    }

    private val delegate: RNCViewPagerManagerDelegate<ComposePagerView, PagerViewViewManager> =
        RNCViewPagerManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<ComposePagerView> = delegate

    override fun getName(): String {
        return NAME
    }

    public override fun createViewInstance(reactContext: ThemedReactContext): ComposePagerView {
        return ComposePagerView(reactContext)
    }

    override fun addView(host: ComposePagerView, child: View, index: Int) {
        host.addPage(child, index)
    }

    override fun getChildCount(parent: ComposePagerView) = parent.getPageCount()

    override fun getChildAt(parent: ComposePagerView, index: Int): View {
        return parent.getPageAt(index)
    }

    override fun removeView(parent: ComposePagerView, view: View) {
        parent.removePage(view)
    }

    override fun removeAllViews(parent: ComposePagerView) {
        parent.removeAllPages()
    }

    override fun removeViewAt(parent: ComposePagerView, index: Int) {
        parent.removePageAt(index)
    }

    override fun needsCustomLayoutForChildren(): Boolean {
        return true
    }

    override fun onDropViewInstance(view: ComposePagerView) {
        view.dispose()
        super.onDropViewInstance(view)
    }

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    override fun setScrollEnabled(view: ComposePagerView, value: Boolean) {
        view.setScrollEnabled(value)
    }

    @ReactProp(name = "layoutDirection")
    override fun setLayoutDirection(view: ComposePagerView, value: String?) {
        if (value != null) {
            view.setLayoutDirection(value)
        }
    }

    @ReactProp(name = "initialPage", defaultInt = 0)
    override fun setInitialPage(view: ComposePagerView, value: Int) {
        view.setInitialPage(value)
    }

    @ReactProp(name = "orientation")
    override fun setOrientation(view: ComposePagerView, value: String?) {
        if (value != null) {
            view.setOrientation(value)
        }
    }

    @ReactProp(name = "offscreenPageLimit", defaultInt = -1)
    override fun setOffscreenPageLimit(view: ComposePagerView, value: Int) {
        view.setOffscreenPageLimit(value)
    }

    @ReactProp(name = "pageMargin", defaultInt = 0)
    override fun setPageMargin(view: ComposePagerView, value: Int) {
        view.setPageMargin(value)
    }

    @ReactProp(name = "overScrollMode")
    override fun setOverScrollMode(view: ComposePagerView, value: String?) {
        if (value != null) {
            view.setOverScrollMode(value)
        }
    }

    // iOS only.
    @ReactProp(name = "overdrag")
    override fun setOverdrag(view: ComposePagerView, value: Boolean) = Unit

    // Dismissed from JS on Android, see PagerView.tsx.
    @ReactProp(name = "keyboardDismissMode")
    override fun setKeyboardDismissMode(view: ComposePagerView, value: String?) = Unit

    override fun setPage(view: ComposePagerView, selectedPage: Int) {
        view.setCurrentItem(selectedPage, true)
    }

    override fun setPageWithoutAnimation(view: ComposePagerView, selectedPage: Int) {
        view.setCurrentItem(selectedPage, false)
    }

    override fun setScrollEnabledImperatively(view: ComposePagerView, scrollEnabled: Boolean) {
        view.setScrollEnabled(scrollEnabled)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> = mutableMapOf(
        PageScrollEvent.EVENT_NAME to mapOf("registrationName" to "onPageScroll"),
        PageScrollStateChangedEvent.EVENT_NAME to mapOf("registrationName" to "onPageScrollStateChanged"),
        PageSelectedEvent.EVENT_NAME to mapOf("registrationName" to "onPageSelected"),
    )
}
