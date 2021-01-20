package com.reactnativecommunityviewpager

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import androidx.fragment.app.Fragment

class PageFragment(private val child: View?) : Fragment() {
  override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
    return child?.apply {
      layoutParams.width = MATCH_PARENT
      layoutParams.height = MATCH_PARENT
    }
      ?: View(inflater.context)
  }
}
