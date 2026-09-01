package com.reactnativepagerview

import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.*
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNCViewPagerManagerDelegate
import com.facebook.react.viewmanagers.RNCViewPagerManagerInterface
import com.facebook.soloader.SoLoader
import com.reactnativepagerview.event.PageScrollEvent
import com.reactnativepagerview.event.PageScrollStateChangedEvent
import com.reactnativepagerview.event.PageSelectedEvent


@ReactModule(name = PagerViewViewManager.NAME)
class PagerViewViewManager : ViewGroupManager<ComposePagerView>(), RNCViewPagerManagerInterface<ComposePagerView> {
    companion object {
        const val NAME = "RNCViewPager"

        init {
            if (BuildConfig.CODEGEN_MODULE_REGISTRATION != null) {
                SoLoader.loadLibrary(BuildConfig.CODEGEN_MODULE_REGISTRATION)
            }
        }
    }

    private val mDelegate: ViewManagerDelegate<ComposePagerView> = RNCViewPagerManagerDelegate(this)

    override fun getDelegate() = mDelegate

    override fun getName(): String {
        return NAME
    }

    override fun receiveCommand(root: ComposePagerView, commandId: String, args: ReadableArray?) {
        mDelegate.receiveCommand(root, commandId, args)
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
    override fun setScrollEnabled(view: ComposePagerView?, value: Boolean) {
        if (view != null) {
            view.setScrollEnabled(value)
        }
    }

    @ReactProp(name = "layoutDirection")
    override fun setLayoutDirection(view: ComposePagerView?, value: String?) {
        if (view != null && value != null) {
            view.setLayoutDirection(value)
        }
    }

    @ReactProp(name = "initialPage", defaultInt = 0)
    override fun setInitialPage(view: ComposePagerView?, value: Int) {
        if (view != null) {
            view.setInitialPage(value)
        }
    }

    @ReactProp(name = "orientation")
    override fun setOrientation(view: ComposePagerView?, value: String?) {
        if (view != null && value != null) {
            view.setOrientation(value)
        }
    }

    @ReactProp(name = "offscreenPageLimit", defaultInt = -1)
    override fun setOffscreenPageLimit(view: ComposePagerView?, value: Int) {
        if (view != null) {
            view.setOffscreenPageLimit(value)
        }
    }

    @ReactProp(name = "pageMargin", defaultInt = 0)
    override fun setPageMargin(view: ComposePagerView?, value: Int) {
        if (view != null) {
            view.setPageMargin(value)
        }
    }

    @ReactProp(name = "overScrollMode")
    override fun setOverScrollMode(view: ComposePagerView?, value: String?) {
        if (view != null && value != null) {
            view.setOverScrollMode(value)
        }
    }

    @ReactProp(name = "overdrag")
    override fun setOverdrag(view: ComposePagerView?, value: Boolean) {
        return
    }

    @ReactProp(name = "keyboardDismissMode")
    override fun setKeyboardDismissMode(view: ComposePagerView?, value: String?) {
        return
    }

    fun goTo(root: ComposePagerView?, selectedPage: Int, scrollWithAnimation: Boolean) {
        if (root == null) {
            return
        }
        if (selectedPage < 0 || selectedPage >= root.getPageCount()) {
            return
        }
        root.setCurrentItem(selectedPage, scrollWithAnimation)
    }

    override fun setPage(view: ComposePagerView?, selectedPage: Int) {
        goTo(view, selectedPage, true)
    }

    override fun setPageWithoutAnimation(view: ComposePagerView?, selectedPage: Int) {
        goTo(view, selectedPage, false)
    }

    override fun setScrollEnabledImperatively(view: ComposePagerView?, scrollEnabled: Boolean) {
        if (view != null) {
            view.setScrollEnabled(scrollEnabled)
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Map<String, String>> {
        return MapBuilder.of(
                PageScrollEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScroll"),
                PageScrollStateChangedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScrollStateChanged"),
                PageSelectedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageSelected"))
    }
}
