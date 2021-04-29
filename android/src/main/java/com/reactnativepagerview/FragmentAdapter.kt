package com.reactnativepagerview

import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.recyclerview.widget.DiffUtil
import androidx.viewpager2.adapter.FragmentStateAdapter


class FragmentAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
  private val childrenViews = mutableListOf<View>()
  private var count = 0
  private var offset = 0
  private var isDirty = false
  private val prevItemIds = mutableListOf<Long>()

  override fun createFragment(position: Int): Fragment {
    return ViewPagerFragment(getViewAtPosition(position))
  }

  override fun getItemCount() = count

  override fun getItemId(position: Int): Long {
    val view = getViewAtPosition(position)
    return view?.id?.toLong() ?: UNRENDERED_ID_OFFSET + position
  }

  override fun containsItem(itemId: Long): Boolean {
    if (itemId >= UNRENDERED_ID_OFFSET) {
      val position = itemId - UNRENDERED_ID_OFFSET
      return getViewAtPosition(position.toInt()) == null
    }
    return childrenViews.any { it.id.toLong() == itemId }
  }

  /**
   * Returns true if any changes were applied.
   */
  fun notifyAboutChanges(): Boolean {
    if (!isDirty) {
      return false
    }

    isDirty = false
    val diff = DiffUtil.calculateDiff(
      PagerDiffCallback(prevItemIds, this),
      false
    )
    diff.dispatchUpdatesTo(this)
    return true
  }

  fun setCount(count: Int) {
    if (this.count != count) {
      markDirty()
      this.count = count
    }
  }

  fun setOffset(offset: Int) {
    if (this.offset != offset) {
      markDirty()
      this.offset = offset
    }
  }

  fun addReactView(child: View, index: Int) {
    markDirty()
    childrenViews.add(index, child)
  }

  fun getReactChildAt(index: Int) = childrenViews[index]

  fun getReactChildCount() = childrenViews.size

  fun removeReactViewAt(index: Int) {
    markDirty()
    childrenViews.removeAt(index)
  }

  private fun getViewAtPosition(position: Int): View? {
    val index = position - offset
    return if (index >= 0 && index < childrenViews.size) childrenViews[index] else null
  }

  private fun markDirty() {
    if (isDirty) {
      return
    }
    isDirty = true
    prevItemIds.clear()
    for (position in 0 until itemCount) {
      prevItemIds.add(getItemId(position))
    }
  }

  companion object {
    /**
     * If an id is `UNRENDERED_ID_OFFSET` or higher, it represents a view
     * that is not currently rendered.
     */
    const val UNRENDERED_ID_OFFSET = 0xffffffffL
  }
}
