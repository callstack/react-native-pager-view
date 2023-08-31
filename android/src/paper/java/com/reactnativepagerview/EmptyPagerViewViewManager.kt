package com.reactnativepagerview

import com.facebook.react.uimanager.ViewGroupManager
import android.widget.FrameLayout
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext


@ReactModule(name = "RNCScrollViewPager")
class EmptyPagerViewViewManager : ViewGroupManager<FrameLayout>() {
    override fun getName() = "RNCScrollViewPager"

    override fun createViewInstance(context: ThemedReactContext): FrameLayout {
        throw Error("RNCScrollViewPager is only supported for iOS")
    }
}