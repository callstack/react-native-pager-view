package com.reactnativepagerview

import com.facebook.react.uimanager.ViewGroupManager
import android.widget.FrameLayout
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext

// Note: The LEGACY_ variant is an iOS-only feature and the related Android files
// are only included because of and relevant to auxiliary processes, like Codegen.
@ReactModule(name = LEGACY_PagerViewViewManagerImpl.NAME)
class LEGACY_PagerViewViewManager : ViewGroupManager<FrameLayout>() {
    override fun getName() = LEGACY_PagerViewViewManagerImpl.NAME

    override fun createViewInstance(context: ThemedReactContext): FrameLayout {
        throw Error("LEGACY_RNCViewPager is an iOS-only feature")
    }
}
