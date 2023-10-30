package com.reactnativepagerview

import com.facebook.react.uimanager.ViewGroupManager
import android.widget.FrameLayout
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext


@ReactModule(name = "LEGACY_RNCViewPager")
class LEGACY_PagerViewViewManager : ViewGroupManager<FrameLayout>() {
    override fun getName() = "LEGACY_RNCViewPager"

    override fun createViewInstance(context: ThemedReactContext): FrameLayout {
        throw Error("LEGACY_RNCViewPager is an iOS-only feature")
    }
}