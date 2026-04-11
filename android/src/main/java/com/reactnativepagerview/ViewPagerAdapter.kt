package com.reactnativepagerview

import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.recyclerview.widget.RecyclerView.Adapter
import java.util.*

private fun View.detachFromParent() {
  (parent as? ViewGroup)?.removeView(this)
}

class ViewPagerAdapter() : Adapter<ViewPagerViewHolder>() {
  private val childrenViews: ArrayList<View> = ArrayList()

  override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewPagerViewHolder {
    return ViewPagerViewHolder.create(parent)
  }

  override fun onBindViewHolder(holder: ViewPagerViewHolder, index: Int) {
    val container: FrameLayout = holder.container
    val child = getChildAt(index)

    if (container.childCount > 0) {
      container.removeAllViews()
    }

    child.detachFromParent()

    container.addView(child)
  }

  override fun onViewRecycled(holder: ViewPagerViewHolder) {
    super.onViewRecycled(holder)
    holder.container.removeAllViews()
  }

  override fun onFailedToRecycleView(holder: ViewPagerViewHolder): Boolean {
    holder.container.removeAllViews()
    return true
  }

  override fun getItemCount(): Int {
    return childrenViews.size
  }

  fun addChild(child: View, index: Int) {
    childrenViews.add(index, child)
    notifyItemInserted(index)
  }

  fun getChildAt(index: Int): View {
    return childrenViews[index]
  }

  fun removeChild(child: View) {
    val index = childrenViews.indexOf(child)

    if (index > -1) {
      removeChildAt(index)
    }
  }

  fun removeAll() {
    for (child in childrenViews) {
      child.detachFromParent()
    }
    val removedChildrenCount = childrenViews.size
    childrenViews.clear()
    notifyItemRangeRemoved(0, removedChildrenCount)
  }

  fun removeChildAt(index: Int) {
    if (index >= 0 && index < childrenViews.size) {
      childrenViews[index].detachFromParent()
      childrenViews.removeAt(index)
      notifyItemRemoved(index)
    }
  }
}
