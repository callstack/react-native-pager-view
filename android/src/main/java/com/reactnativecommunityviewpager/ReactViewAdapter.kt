package com.reactnativecommunityviewpager

import android.database.Observable
import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter

private class AdapterObservable : Observable<PageFragment>() {
  fun onReactViewUpdate() {
    for (observer in mObservers) {
      observer.onReactViewUpdate()
    }
  }
}

const val ARG_POSITION = "position"

class ReactViewAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
  private val mReactChildrenViews = ArrayList<View>()
  private val mObservable = AdapterObservable()
  var count = 0
  var offset = 0

  override fun getItemCount() = count

  override fun createFragment(position: Int): Fragment {
    val page = PageFragment()
    page.arguments = Bundle().apply { putInt(ARG_POSITION, position) }
    page.adapter = this
    return page
  }

  fun getViewAtPosition(position: Int): View? {
    return try {
      mReactChildrenViews[position - offset]
    } catch (e: IndexOutOfBoundsException) {
      null
    }
  }

  fun addReactView(child: View, index: Int) = mReactChildrenViews.add(index, child)
  fun getReactChildAt(index: Int) = mReactChildrenViews[index]
  fun getReactChildCount() = mReactChildrenViews.size
  fun removeReactViewAt(index: Int) = mReactChildrenViews.removeAt(index)
  fun onAfterUpdateTransaction() = mObservable.onReactViewUpdate()
  fun registerReactPageObserver(page: PageFragment) = mObservable.registerObserver(page)
  fun unregisterReactPageObserver(page: PageFragment) = mObservable.unregisterObserver(page)
}
