package com.reactnativepagerview

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.recyclerview.widget.RecyclerView.ViewHolder


class ViewPagerViewHolder private constructor(container: FrameLayout) : ViewHolder(container) {
    val container: FrameLayout
        get() = itemView as FrameLayout

    companion object {
        fun create(parent: ViewGroup): ViewPagerViewHolder {
            val container = FrameLayout(parent.context)
            container.layoutParams = ViewGroup.LayoutParams(-1, -1)
            container.isSaveEnabled = false
            return ViewPagerViewHolder(container)
        }
    }
}