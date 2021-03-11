package com.reactnativepagerview

import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter
import java.util.*


class FragmentAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
  private val childrenViews: MutableList<View> = ArrayList()
  override fun createFragment(position: Int): Fragment {
    return ViewPagerFragment(childrenViews[position])
  }

  override fun getItemCount(): Int {
    return childrenViews.size
  }

  override fun getItemId(position: Int): Long {
    return childrenViews[position].id.toLong()
  }

  override fun containsItem(itemId: Long): Boolean {
    for (child in childrenViews) {
      if (itemId.toInt() == child.id) {
        return true
      }
    }
    return false
  }

  fun addFragment(child: View, index: Int) {
    childrenViews.add(index, child)
    notifyItemInserted(index)
  }

  fun removeFragment(child: View) {
    val index = childrenViews.indexOf(child)
    removeFragmentAt(index)
  }

  fun removeFragmentAt(index: Int) {
    childrenViews.removeAt(index)
    notifyItemRemoved(index)
  }

  fun removeAll() {
    childrenViews.clear()
    notifyDataSetChanged()
  }

  fun getChildViewAt(index: Int): View {
    return childrenViews[index]
  }
}
