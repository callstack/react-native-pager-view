package com.reactnativepagerview.event

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event


/**
 * Event emitted by [ReactViewPager] when selected page changes.
 *
 * Additional data provided by this event:
 * - position - index of page that has been selected
 */
class PageSelectedEvent(surfaceId: Int, viewTag: Int, private val mPosition: Int) : Event<PageSelectedEvent>(surfaceId, viewTag) {
    constructor(viewTag: Int, mPosition: Int) : this(-1, viewTag, mPosition)
    override fun getEventName(): String {
        return EVENT_NAME
    }

    override fun canCoalesce(): Boolean {
      return false
    }

    override fun getEventData(): WritableMap {
        val eventData = Arguments.createMap()
        eventData.putInt("position", mPosition)
        return eventData
    }

    companion object {
        const val EVENT_NAME = "topPageSelected"
    }

}
