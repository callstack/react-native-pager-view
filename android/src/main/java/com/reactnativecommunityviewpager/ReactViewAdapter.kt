package com.reactnativecommunityviewpager

import android.view.View
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter
import kotlin.math.max
import kotlin.math.min

class ReactViewAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
  private var mPrevOffset = 0
  private var mPrevReactChildrenCount = 0
  private val mReactChildrenViews = ArrayList<View>()
  var count = 0
  var offset = 0

  override fun getItemCount() = count

  override fun createFragment(position: Int) = PageFragment(getViewAtPosition(position))

  private fun getViewAtPosition(position: Int): View? {
    return try {
      mReactChildrenViews[position - offset]
    } catch (e: IndexOutOfBoundsException) {
      null
    }
  }

  fun onAfterUpdateTransaction() {
    val changedPositions = (offset until offset + mReactChildrenViews.size).toMutableSet()
    val bound = min(
      count,
      mPrevOffset + max(mPrevReactChildrenCount, mReactChildrenViews.size)
    )
    for (position in mPrevOffset until bound) {
      if (changedPositions.contains(position)) {
        changedPositions.remove(position)
      } else {
        changedPositions.add(position)
      }
    }

    for (position in changedPositions) {
      notifyItemChanged(position)
    }

    mPrevOffset = offset
    mPrevReactChildrenCount = mReactChildrenViews.size
  }

  fun addReactView(child: View, index: Int) = mReactChildrenViews.add(index, child)
  fun getReactChildAt(index: Int) = mReactChildrenViews[index]
  fun getReactChildCount() = mReactChildrenViews.size
  fun removeReactViewAt(index: Int) = mReactChildrenViews.removeAt(index)
}
