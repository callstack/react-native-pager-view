package com.reactnativecommunityviewpager

import android.view.View
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.widget.ViewPager2
import androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback
import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter

class ViewPagerViewManager : ViewGroupManager<ViewPager2>() {
  override fun getName() = "RNCViewPager"

  override fun createViewInstance(reactContext: ThemedReactContext): ViewPager2 {
    return ViewPager2(reactContext).apply {
      adapter = ReactViewAdapter(reactContext.currentActivity as FragmentActivity)

      registerOnPageChangeCallback(object : OnPageChangeCallback() {
        override fun onPageSelected(position: Int) {
          reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(
            id,
            "topPageSelected",
            Arguments.createMap().apply { putInt("page", position) }
          )
        }
      })
    }
  }

  override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
    return mapOf(
      "topPageSelected" to mapOf(
        "phasedRegistrationNames" to mapOf("bubbled" to "onPageSelected")
      )
    )
  }

  override fun addView(parent: ViewPager2, child: View, index: Int) {
    (parent.adapter as ReactViewAdapter).addReactView(child, index)
  }

  override fun getChildAt(parent: ViewPager2, index: Int): View {
    return (parent.adapter as ReactViewAdapter).getReactChildAt(index)
  }

  override fun getChildCount(parent: ViewPager2): Int {
    return (parent.adapter as ReactViewAdapter).getReactChildCount()
  }

  override fun removeViewAt(parent: ViewPager2, index: Int) {
    (parent.adapter as ReactViewAdapter).removeReactViewAt(index)
  }

  override fun onAfterUpdateTransaction(view: ViewPager2) {
    (view.adapter as ReactViewAdapter).onAfterUpdateTransaction()
    super.onAfterUpdateTransaction(view)
  }

  @ReactProp(name = "count")
  fun setCount(view: ViewPager2, count: Int) {
    (view.adapter as ReactViewAdapter).count = count
  }

  @ReactProp(name = "offset")
  fun setOffset(view: ViewPager2, offset: Int) {
    (view.adapter as ReactViewAdapter).offset = offset
  }
}
