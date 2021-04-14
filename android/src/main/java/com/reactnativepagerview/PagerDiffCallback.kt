package com.reactnativepagerview

import androidx.recyclerview.widget.DiffUtil
import com.reactnativepagerview.FragmentAdapter.Companion.UNRENDERED_ID_OFFSET

class PagerDiffCallback(private val oldList: List<Long>, private val adapter: FragmentAdapter) : DiffUtil.Callback() {
  override fun getOldListSize() = oldList.size

  override fun getNewListSize() = adapter.itemCount

  override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
    val oldId = oldList[oldItemPosition]
    val newId = adapter.getItemId(newItemPosition)
    if (UNRENDERED_ID_OFFSET in (newId + 1)..oldId) {
      // When the old item is not rendered but the new item is rendered,
      // consider the same if the items are in the same position.
      return oldItemPosition == newItemPosition
    }
    return oldId == newId
  }

  override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
    return oldList[oldItemPosition] == adapter.getItemId(newItemPosition)
  }
}
