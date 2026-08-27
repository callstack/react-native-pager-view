package com.reactnativepagerview.event

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event


/**
 * Event emitted by [ReactViewPager] when user scrolling state changed.
 *
 * Additional data provided by this event:
 * - pageScrollState - {Idle,Dragging,Settling}
 */
class PageScrollStateChangedEvent(surfaceId: Int, viewTag: Int, private val mPageScrollState: String) : Event<PageScrollStateChangedEvent>(surfaceId, viewTag) {
    constructor(viewTag: Int, mPageScrollState: String) : this(-1, viewTag, mPageScrollState)
    override fun getEventName(): String {
        return EVENT_NAME
    }

    override fun canCoalesce(): Boolean {
        return false
    }

    override fun getEventData(): WritableMap {
        val eventData = Arguments.createMap()
        eventData.putString("pageScrollState", mPageScrollState)
        return eventData
    }

    companion object {
        const val EVENT_NAME = "topPageScrollStateChanged"
    }

}
