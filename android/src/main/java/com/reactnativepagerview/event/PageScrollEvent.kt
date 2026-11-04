package com.reactnativepagerview.event

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event


/**
 * Event emitted by [com.reactnativepagerview.ComposePagerView] when user scrolls between pages
 * (or when animating between pages).
 *
 * Additional data provided by this event:
 * - position - index of first page from the left that is currently visible
 * - offset - value from range [0,1) describing stage between page transitions. Value x means that
 * (1 - x) fraction of the page at "position" index is visible, and x fraction of the next page
 * is visible.
 */
class PageScrollEvent(surfaceId: Int, viewTag: Int, private val mPosition: Int, offset: Float) : Event<PageScrollEvent>(surfaceId, viewTag) {
    // folly::toJson default options don't support serialize NaN or Infinite value
    private val mOffset: Float = if (offset.isFinite()) offset else 0.0f

    override fun getEventName(): String {
        return EVENT_NAME
    }

    override fun getEventData(): WritableMap {
        val eventData = Arguments.createMap()
        eventData.putInt("position", mPosition)
        eventData.putDouble("offset", mOffset.toDouble())
        return eventData
    }

    companion object {
        const val EVENT_NAME = "topPageScroll"
    }
}
