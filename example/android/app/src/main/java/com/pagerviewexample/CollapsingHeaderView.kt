package com.pagerviewexample

import android.content.Context
import android.view.View
import android.view.ViewGroup
import androidx.core.view.NestedScrollingParent3
import androidx.core.view.NestedScrollingParentHelper
import androidx.core.view.ViewCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import kotlin.math.max
import kotlin.math.min

/**
 * Stands in for a native collapsing header (a CoordinatorLayout or NestedScrollView parent):
 * it moves its children up by the nested pre-scroll of a vertical scroller below, up to
 * collapseRange, and brings them back once that scroller is at its top.
 */
class CollapsingHeaderView(context: Context) : ViewGroup(context), NestedScrollingParent3 {
  private val parentHelper = NestedScrollingParentHelper(this)
  var collapseRange = 0
  private var collapsed = 0

  // React Native lays the children out itself.
  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) = Unit

  override fun onStartNestedScroll(child: View, target: View, axes: Int, type: Int): Boolean =
    axes and ViewCompat.SCROLL_AXIS_VERTICAL != 0

  override fun onNestedScrollAccepted(child: View, target: View, axes: Int, type: Int) {
    parentHelper.onNestedScrollAccepted(child, target, axes, type)
  }

  override fun onStopNestedScroll(target: View, type: Int) {
    parentHelper.onStopNestedScroll(target, type)
  }

  override fun onNestedPreScroll(target: View, dx: Int, dy: Int, consumed: IntArray, type: Int) {
    if (dy <= 0) return
    val delta = min(dy, collapseRange - collapsed)
    collapseBy(delta)
    consumed[1] += delta
  }

  override fun onNestedScroll(
    target: View,
    dxConsumed: Int,
    dyConsumed: Int,
    dxUnconsumed: Int,
    dyUnconsumed: Int,
    type: Int,
    consumed: IntArray
  ) {
    if (dyUnconsumed >= 0) return
    val delta = max(dyUnconsumed, -collapsed)
    collapseBy(delta)
    consumed[1] += delta
  }

  override fun onNestedScroll(
    target: View,
    dxConsumed: Int,
    dyConsumed: Int,
    dxUnconsumed: Int,
    dyUnconsumed: Int,
    type: Int
  ) = Unit

  // A framework ScrollView makes these calls, as NestedScrollView and CoordinatorLayout handle.
  override fun onStartNestedScroll(child: View, target: View, axes: Int): Boolean =
    onStartNestedScroll(child, target, axes, ViewCompat.TYPE_TOUCH)

  override fun onNestedScrollAccepted(child: View, target: View, axes: Int) {
    onNestedScrollAccepted(child, target, axes, ViewCompat.TYPE_TOUCH)
  }

  override fun onStopNestedScroll(target: View) {
    onStopNestedScroll(target, ViewCompat.TYPE_TOUCH)
  }

  override fun onNestedPreScroll(target: View, dx: Int, dy: Int, consumed: IntArray) {
    onNestedPreScroll(target, dx, dy, consumed, ViewCompat.TYPE_TOUCH)
  }

  override fun onNestedScroll(
    target: View,
    dxConsumed: Int,
    dyConsumed: Int,
    dxUnconsumed: Int,
    dyUnconsumed: Int
  ) {
    onNestedScroll(
      target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, ViewCompat.TYPE_TOUCH, IntArray(2)
    )
  }

  override fun getNestedScrollAxes(): Int = parentHelper.nestedScrollAxes

  override fun addView(child: View?, index: Int) {
    super.addView(child, index)
    applyCollapse()
  }

  private fun collapseBy(delta: Int) {
    collapsed += delta
    applyCollapse()
  }

  fun clampCollapse() {
    collapsed = min(collapsed, collapseRange)
    applyCollapse()
  }

  private fun applyCollapse() {
    for (i in 0 until childCount) {
      getChildAt(i).translationY = -collapsed.toFloat()
    }
  }
}

class CollapsingHeaderViewManager : ViewGroupManager<CollapsingHeaderView>() {
  override fun getName() = REACT_CLASS

  override fun createViewInstance(context: ThemedReactContext) = CollapsingHeaderView(context)

  @ReactProp(name = "collapseRange")
  fun setCollapseRange(view: CollapsingHeaderView, dp: Float) {
    view.collapseRange = (dp * view.resources.displayMetrics.density).toInt()
    view.clampCollapse()
  }

  companion object {
    const val REACT_CLASS = "CollapsingHeaderView"
  }
}

class ExamplePackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? = null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider { emptyMap() }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(CollapsingHeaderViewManager())
}
