package com.reactnativecommunityviewpager

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.widget.FrameLayout
import androidx.fragment.app.Fragment

class PageFragment : Fragment() {
  private var mPosition: Int = -1
  var adapter: ReactViewAdapter? = null

  override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
    return FrameLayout(inflater.context)
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    arguments?.takeIf { it.containsKey(ARG_POSITION) }?.apply {
      mPosition = getInt(ARG_POSITION)
    }
    adapter?.registerReactPageObserver(this)
    onReactViewUpdate()
  }

  override fun onDestroyView() {
    (view as FrameLayout).removeAllViews()
    adapter?.unregisterReactPageObserver(this)
    super.onDestroyView()
  }

  fun onReactViewUpdate() {
    val dataView = adapter?.getViewAtPosition(mPosition)
    if (dataView != null) {
      val rootView = view as FrameLayout
      if (rootView.childCount == 1 && rootView.getChildAt(0) == dataView) {
        return
      }

      (dataView.parent as FrameLayout?)?.removeAllViews()
      rootView.removeAllViews()
      rootView.addView(dataView, MATCH_PARENT, MATCH_PARENT)
    }
  }
}
