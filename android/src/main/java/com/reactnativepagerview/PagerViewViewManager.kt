package com.reactnativepagerview

import android.view.View
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.widget.ViewPager2
import androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback
import com.facebook.react.bridge.ReadableArray
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
        eventDispatcher = reactContext.getNativeModule(UIManagerModule::class.java)!!.eventDispatcher
        vp.registerOnPageChangeCallback(object : OnPageChangeCallback() {
            override fun onPageScrolled(position: Int, positionOffset: Float, positionOffsetPixels: Int) {
                eventDispatcher.dispatchEvent(
                        PageScrollEvent(vp.id, position, positionOffset))
            }

            override fun onPageSelected(position: Int) {
                eventDispatcher.dispatchEvent(
                        PageSelectedEvent(vp.id, position))
                adapter.onPageSelected(position)
            }

            override fun onPageScrollStateChanged(state: Int) {
                val pageScrollState = when (state) {
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

    override fun addView(parent: ViewPager2, child: View, index: Int) {
        val adapter = parent.adapter as FragmentAdapter
        adapter.addReactView(child, index)
        postUpdate(parent, adapter)
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
        postUpdate(parent, adapter)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Map<String, String>> {
        return mapOf(
                PageScrollEvent.EVENT_NAME to mapOf("registrationName" to "onPageScroll"),
                PageScrollStateChangedEvent.EVENT_NAME to mapOf("registrationName" to "onPageScrollStateChanged"),
                PageSelectedEvent.EVENT_NAME to mapOf("registrationName" to "onPageSelected")
        )
    }

    override fun onAfterUpdateTransaction(view: ViewPager2) {
        super.onAfterUpdateTransaction(view)
        updatePager(view, (view.adapter as FragmentAdapter).getTransactionId())
    }

    override fun receiveCommand(view: ViewPager2, commandId: String, args: ReadableArray?) {
        if (("setPage" == commandId) && args != null) {
            setCurrentItem(view, args.getInt(0), args.getBoolean(1))
            return
        } else if (("setScrollEnabled" == commandId) && args != null) {
            view.isUserInputEnabled = args.getBoolean(0)
            return
        }
        throw IllegalArgumentException(String.format(
                "Unsupported command %s received by %s.",
                commandId,
                javaClass.simpleName))
    }

    @ReactProp(name = "childrenKeys")
    fun setChildrenKeys(view: ViewPager2, childrenKeys: ReadableArray) {
        val adapter = view.adapter as FragmentAdapter
        val numKeys = childrenKeys.size()
        for (i in 0 until numKeys) {
            childrenKeys.getString(i)?.let { adapter.queueKeyToProcess(it) }
        }
    }

    @ReactProp(name = "count")
    fun setCount(view: ViewPager2, count: Int) {
        (view.adapter as FragmentAdapter).setCount(count)
    }

    @ReactProp(name = "offscreenPageLimit", defaultInt = ViewPager2.OFFSCREEN_PAGE_LIMIT_DEFAULT)
    fun setOffscreenPageLimit(view: ViewPager2, limit: Int) {
        view.offscreenPageLimit = limit
    }

    @ReactProp(name = "offset")
    fun setOffset(view: ViewPager2, offset: Int) {
        (view.adapter as FragmentAdapter).setOffset(offset)
    }

    @ReactProp(name = "orientation")
    fun setOrientation(view: ViewPager2, orientation: String) {
        view.orientation = if (("vertical" == orientation)) ViewPager2.ORIENTATION_VERTICAL else ViewPager2.ORIENTATION_HORIZONTAL
    }

    @ReactProp(name = "overdrag", defaultBoolean = true)
    fun setOverdrag(view: ViewPager2, overdrag: Boolean) {
        view.getChildAt(0).overScrollMode = if (overdrag) ViewPager2.OVER_SCROLL_IF_CONTENT_SCROLLS else ViewPager2.OVER_SCROLL_NEVER
    }

    @ReactProp(name = "pageMargin", defaultFloat = 0f)
    fun setPageMargin(view: ViewPager2, margin: Float) {
        val pageMargin = PixelUtil.toPixelFromDIP(margin).toInt()

        // Don't use MarginPageTransformer to be able to support negative margins.
        view.setPageTransformer { page, position ->
            val offset = pageMargin * position
            if (view.orientation == ViewPager2.ORIENTATION_HORIZONTAL) {
                val isRTL = view.layoutDirection == View.LAYOUT_DIRECTION_RTL
                page.translationX = if (isRTL) -offset else offset
            } else {
                page.translationY = offset
            }
        }
    }

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    fun setScrollEnabled(view: ViewPager2, enabled: Boolean) {
        view.isUserInputEnabled = enabled
    }

    private fun updatePager(view: ViewPager2, transactionId: Int) {
        val adapter = view.adapter as FragmentAdapter
        val position = adapter.onAfterUpdateTransaction(transactionId)
        if (position != null) {
            eventDispatcher.dispatchEvent(
                    PageSelectedEvent(view.id, position))
            adapter.onPageSelected(position)
        }
    }

    private fun postUpdate(view: ViewPager2, adapter: FragmentAdapter) {
        val transactionId = adapter.getTransactionId()
        view.post { updatePager(view, transactionId) }
    }

    private fun setCurrentItem(view: ViewPager2, item: Int, smoothScroll: Boolean) {
        view.post {
            view.measure(
                    View.MeasureSpec.makeMeasureSpec(view.width, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(view.height, View.MeasureSpec.EXACTLY))
            view.layout(view.left, view.top, view.right, view.bottom)
        }
        view.setCurrentItem(item, smoothScroll)
    }

    companion object {
        private const val REACT_CLASS = "RNCViewPager"
    }
}
