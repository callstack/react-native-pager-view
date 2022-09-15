package com.reactnativepagerview

import com.facebook.react.uimanager.ThemedReactContext
import android.graphics.Color

object PagerViewViewManagerImpl {
    const val NAME = "PagerViewView"
    fun createViewInstance(context: ThemedReactContext?): PagerViewView {
        return PagerViewView(context)
    }

    fun setColor(view: PagerViewView, color: String?) {
        view.setBackgroundColor(Color.parseColor(color))
    }
}