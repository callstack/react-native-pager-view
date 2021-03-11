package com.reactnativepagerview

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment


class ViewPagerFragment : Fragment {
  private var reactView: View? = null

  constructor(child: View?) {
    reactView = child
  }

  constructor() {}

  override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
    return if (reactView != null) reactView else View(context)
  }
}

