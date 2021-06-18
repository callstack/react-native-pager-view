package com.reactnativepagerview

import android.view.View
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.widget.ViewPager2
import androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback
import com.facebook.infer.annotation.Assertions
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.EventDispatcher
import com.reactnativepagerview.event.PageScrollEvent
import com.reactnativepagerview.event.PageScrollStateChangedEvent
import com.reactnativepagerview.event.PageSelectedEvent


class PagerViewViewManager : ViewGroupManager<ViewPager2>() {
  private lateinit var eventDispatcher: EventDispatcher

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): ViewPager2 {
    val vp = ViewPager2(reactContext)
    val adapter = FragmentAdapter((reactContext.currentActivity as FragmentActivity?)!!)
    vp.adapter = adapter
    //https://github.com/callstack/react-native-viewpager/issues/183
    vp.isSaveEnabled = false
    eventDispatcher = reactContext.getNativeModule(UIManagerModule::class.java)!!.eventDispatcher
    vp.registerOnPageChangeCallback(object : OnPageChangeCallback() {
      override fun onPageScrolled(position: Int, positionOffset: Float, positionOffsetPixels: Int) {
        eventDispatcher.dispatchEvent(
          PageScrollEvent(vp.id, position, positionOffset))
      }

      override fun onPageSelected(position: Int) {
        eventDispatcher.dispatchEvent(
          PageSelectedEvent(vp.id, position))
      }

      override fun onPageScrollStateChanged(state: Int) {
        val pageScrollState: String = when (state) {
          ViewPager2.SCROLL_STATE_IDLE -> "idle"
          ViewPager2.SCROLL_STATE_DRAGGING -> "dragging"
          ViewPager2.SCROLL_STATE_SETTLING -> "settling"
          else -> throw IllegalStateException("Unsupported pageScrollState")
        }
        eventDispatcher.dispatchEvent(
          PageScrollStateChangedEvent(vp.id, pageScrollState))
      }
    })
    return vp
  }

  private fun setCurrentItem(view: ViewPager2, selectedTab: Int, scrollSmooth: Boolean) {
    view.post { updateLayoutView(view) }
    view.setCurrentItem(selectedTab, scrollSmooth)
  }

  override fun addView(parent: ViewPager2, child: View, index: Int) {
    val adapter = parent.adapter as FragmentAdapter
    adapter.addReactView(child, index)
    postNewChanges(parent)
  }

  override fun getChildCount(parent: ViewPager2): Int {
    return (parent.adapter as FragmentAdapter).getReactChildCount()
  }

  override fun getChildAt(parent: ViewPager2, index: Int): View {
    return (parent.adapter as FragmentAdapter).getReactChildAt(index)
  }

  override fun removeViewAt(parent: ViewPager2, index: Int) {
    val adapter = parent.adapter as FragmentAdapter
    adapter.removeReactViewAt(index)
    postNewChanges(parent)
  }

  override fun needsCustomLayoutForChildren(): Boolean {
    return true
  }

  @ReactProp(name = "count")
  fun setCount(view: ViewPager2, count: Int) {
    (view.adapter as FragmentAdapter).setCount(count)
  }

  @ReactProp(name = "scrollEnabled", defaultBoolean = true)
  fun setScrollEnabled(viewPager: ViewPager2, value: Boolean) {
    viewPager.isUserInputEnabled = value
  }

  @ReactProp(name = "orientation")
  fun setOrientation(viewPager: ViewPager2, value: String) {
    viewPager.orientation = if (value == "vertical") ViewPager2.ORIENTATION_VERTICAL else ViewPager2.ORIENTATION_HORIZONTAL
  }

  @ReactProp(name = "offscreenPageLimit", defaultInt = ViewPager2.OFFSCREEN_PAGE_LIMIT_DEFAULT)
  operator fun set(viewPager: ViewPager2, value: Int) {
    viewPager.offscreenPageLimit = value
  }

  @ReactProp(name = "offset")
  fun setOffset(view: ViewPager2, offset: Int) {
    (view.adapter as FragmentAdapter).setOffset(offset)
  }

  @ReactProp(name = "overScrollMode")
  fun setOverScrollMode(viewPager: ViewPager2, value: String) {
    val child = viewPager.getChildAt(0)
    when (value) {
        "never" -> {
          child.overScrollMode = ViewPager2.OVER_SCROLL_NEVER
        }
        "always" -> {
          child.overScrollMode = ViewPager2.OVER_SCROLL_ALWAYS
        }
        else -> {
          child.overScrollMode = ViewPager2.OVER_SCROLL_IF_CONTENT_SCROLLS
        }
    }
  }

  override fun onAfterUpdateTransaction(view: ViewPager2) {
    super.onAfterUpdateTransaction(view)
    if ((view.adapter as FragmentAdapter).notifyAboutChanges()) {
      view.post { updateLayoutView(view) }
    }
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Map<String, String>> {
    return MapBuilder.of(
      PageScrollEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScroll"),
      PageScrollStateChangedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScrollStateChanged"),
      PageSelectedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageSelected"))
  }

  override fun getCommandsMap(): Map<String, Int>? {
    return MapBuilder.of(
      "setPage",
      COMMAND_SET_PAGE,
      "setPageWithoutAnimation",
      COMMAND_SET_PAGE_WITHOUT_ANIMATION,
      "setScrollEnabled",
      COMMAND_SET_SCROLL_ENABLED)
  }

  override fun receiveCommand(root: ViewPager2, commandId: Int, args: ReadableArray?) {
    super.receiveCommand(root, commandId, args)
    Assertions.assertNotNull(root)
    Assertions.assertNotNull(args)
    val childCount = root.adapter?.itemCount

    when (commandId) {
      COMMAND_SET_PAGE, COMMAND_SET_PAGE_WITHOUT_ANIMATION -> {
        val pageIndex = args!!.getInt(0)
        val canScroll = childCount != null && childCount > 0 && pageIndex >= 0 && pageIndex < childCount
        if (canScroll) {
          val scrollWithAnimation = commandId == COMMAND_SET_PAGE
          setCurrentItem(root, pageIndex, scrollWithAnimation)
          eventDispatcher.dispatchEvent(PageSelectedEvent(root.id, pageIndex))
        }
      }
      COMMAND_SET_SCROLL_ENABLED -> {
        root.isUserInputEnabled = args!!.getBoolean(0)
      }
      else -> throw IllegalArgumentException(String.format(
        "Unsupported command %d received by %s.",
        commandId,
        javaClass.simpleName))
    }
  }

  @ReactProp(name = "pageMargin", defaultFloat = 0F)
  fun setPageMargin(pager: ViewPager2, margin: Float) {
    val pageMargin = PixelUtil.toPixelFromDIP(margin).toInt()
    /**
     * Don't use MarginPageTransformer to be able to support negative margins
     */
    pager.setPageTransformer { page, position ->
      val offset = pageMargin * position
      if (pager.orientation == ViewPager2.ORIENTATION_HORIZONTAL) {
        val isRTL = pager.layoutDirection == View.LAYOUT_DIRECTION_RTL
        page.translationX = if (isRTL) -offset else offset
      } else {
        page.translationY = offset
      }
    }
  }

  private fun postNewChanges(view: ViewPager2) {
    view.post {
      if ((view.adapter as FragmentAdapter).notifyAboutChanges()) {
        updateLayoutView(view)
      }
    }
  }

  /**
   * Helper to trigger ViewPager2 to update.
   */
  private fun updateLayoutView(view: View) {
    view.measure(
      View.MeasureSpec.makeMeasureSpec(view.width, View.MeasureSpec.EXACTLY),
      View.MeasureSpec.makeMeasureSpec(view.height, View.MeasureSpec.EXACTLY))
    view.layout(view.left, view.top, view.right, view.bottom)
  }

  companion object {
    private const val REACT_CLASS = "RNCViewPager"
    private const val COMMAND_SET_PAGE = 1
    private const val COMMAND_SET_PAGE_WITHOUT_ANIMATION = 2
    private const val COMMAND_SET_SCROLL_ENABLED = 3
  }
}
