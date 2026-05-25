package com.reactnativepagerview

import android.view.View
import android.view.ViewGroup
import androidx.viewpager2.widget.ViewPager2
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


@ReactModule(name = PagerViewViewManagerImpl.NAME)
class PagerViewViewManager : ViewGroupManager<ComposePagerView>(), RNCViewPagerManagerInterface<ComposePagerView> {
    companion object {
        init {
            if (BuildConfig.CODEGEN_MODULE_REGISTRATION != null) {
                SoLoader.loadLibrary(BuildConfig.CODEGEN_MODULE_REGISTRATION)
            }
        }
    }

    private val mDelegate: ViewManagerDelegate<ComposePagerView> = RNCViewPagerManagerDelegate(this)

    override fun getDelegate() = mDelegate

    override fun getName(): String {
        return PagerViewViewManagerImpl.NAME
    }

    override fun receiveCommand(root: ComposePagerView, commandId: String, args: ReadableArray?) {
        mDelegate.receiveCommand(root, commandId, args)
    }

    public override fun createViewInstance(reactContext: ThemedReactContext): ComposePagerView {
        return ComposePagerView(reactContext)
    }

    override fun addView(host: ComposePagerView, child: View, index: Int) {
        PagerViewViewManagerImpl.addView(host, child, index)
    }

    override fun getChildCount(parent: ComposePagerView) = PagerViewViewManagerImpl.getChildCount(parent)

    override fun getChildAt(parent: ComposePagerView, index: Int): View {
        return PagerViewViewManagerImpl.getChildAt(parent, index)
    }

    override fun removeView(parent: ComposePagerView, view: View) {
        PagerViewViewManagerImpl.removeView(parent, view)
    }

    override fun removeAllViews(parent: ComposePagerView) {
        PagerViewViewManagerImpl.removeAllViews(parent)
    }

    override fun removeViewAt(parent: ComposePagerView, index: Int) {
        PagerViewViewManagerImpl.removeViewAt(parent, index)
    }

    override fun needsCustomLayoutForChildren(): Boolean {
        return PagerViewViewManagerImpl.needsCustomLayoutForChildren()
    }

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    override fun setScrollEnabled(view: ComposePagerView?, value: Boolean) {
        if (view != null) {
            PagerViewViewManagerImpl.setScrollEnabled(view, value)
        }
    }

    @ReactProp(name = "layoutDirection")
    override fun setLayoutDirection(view: ComposePagerView?, value: String?) {
        if (view != null && value != null) {
            PagerViewViewManagerImpl.setLayoutDirection(view, value)
        }
    }

    @ReactProp(name = "initialPage", defaultInt = 0)
    override fun setInitialPage(view: ComposePagerView?, value: Int) {
        if (view != null) {
            PagerViewViewManagerImpl.setInitialPage(view, value)
        }
    }

    @ReactProp(name = "orientation")
    override fun setOrientation(view: ComposePagerView?, value: String?) {
        if (view != null && value != null) {
            PagerViewViewManagerImpl.setOrientation(view, value)
        }
    }

    @ReactProp(name = "offscreenPageLimit", defaultInt = ViewPager2.OFFSCREEN_PAGE_LIMIT_DEFAULT)
    override fun setOffscreenPageLimit(view: ComposePagerView?, value: Int) {
        if (view != null) {
            PagerViewViewManagerImpl.setOffscreenPageLimit(view, value)
        }
    }

    @ReactProp(name = "pageMargin", defaultInt = 0)
    override fun setPageMargin(view: ComposePagerView?, value: Int) {
        if (view != null) {
            PagerViewViewManagerImpl.setPageMargin(view, value)
        }
    }

    @ReactProp(name = "overScrollMode")
    override fun setOverScrollMode(view: ComposePagerView?, value: String?) {
        if (view != null && value != null) {
            PagerViewViewManagerImpl.setOverScrollMode(view, value)
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
            PagerViewViewManagerImpl.setScrollEnabled(view, scrollEnabled)
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Map<String, String>> {
        return MapBuilder.of(
                PageScrollEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScroll"),
                PageScrollStateChangedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScrollStateChanged"),
                PageSelectedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageSelected"))
    }
}
