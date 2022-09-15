package com.reactnativepagerview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.PagerViewViewManagerDelegate
import com.facebook.react.viewmanagers.PagerViewViewManagerInterface

//@ReactModule(name = PagerViewViewManagerImpl.NAME)
class PagerViewViewManager() : ViewGroupManager<PagerViewView>(), PagerViewViewManagerInterface<PagerViewView> {
    private val mDelegate: ViewManagerDelegate<PagerViewView> = PagerViewViewManagerDelegate(this)

    override fun getDelegate() = mDelegate

    override fun getName(): String {
        return PagerViewViewManagerImpl.NAME
    }

    public override fun createViewInstance(context: ThemedReactContext): PagerViewView {
        return PagerViewViewManagerImpl.createViewInstance(context)
    }

    override fun receiveCommand(root: PagerViewView, commandId: String, args: ReadableArray?) {
        mDelegate.receiveCommand(root, commandId, args)
    }

    override fun setLayoutDirection(view: PagerViewView?, value: String?) {}
    override fun setInitialPage(view: PagerViewView?, value: Int) {}
    override fun setOrientation(view: PagerViewView?, value: String?) {}
    override fun setOffscreenPageLimit(view: PagerViewView?, value: Int) {}
    override fun setPageMargin(view: PagerViewView?, value: Int) {}
    override fun setOverScrollMode(view: PagerViewView?, value: String?) {}
    override fun setPage(view: PagerViewView?, selectedPage: Int) {}
    override fun setPageWithoutAnimation(view: PagerViewView?, selectedPage: Int) {}
    override fun setScrollEnabledImperatively(view: PagerViewView?, scrollEnabled: Boolean) {}
    override fun setScrollEnabled(view: PagerViewView?, scrollEnabled: Boolean) {}
}