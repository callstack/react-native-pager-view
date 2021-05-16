package com.reactnativepagerview

import androidx.recyclerview.widget.DiffUtil
import com.reactnativepagerview.FragmentAdapter.Companion.UNRENDERED_ID_OFFSET

class PagerDiffCallback(private val oldList: List<Long>, private val adapter: FragmentAdapter) : DiffUtil.Callback() {
  override fun getOldListSize() = oldList.size

  override fun getNewListSize() = adapter.itemCount

  override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
    val oldId = oldList[oldItemPosition]
    val newId = adapter.getItemId(newItemPosition)
    // An unrendered item is assumed the same as any item in the same position.
    return if (oldId >= UNRENDERED_ID_OFFSET || newId >= UNRENDERED_ID_OFFSET) oldItemPosition == newItemPosition else oldId == newId
  }

  override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
    return oldList[oldItemPosition] == adapter.getItemId(newItemPosition)
  }
}
