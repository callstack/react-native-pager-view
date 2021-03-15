package com.reactnativepagerview

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.Fragment
import java.lang.ref.WeakReference

class ViewPagerFragment(private var mPosition: Int, child: View?) : Fragment() {
    private var mReactViewRef: WeakReference<View?>

    init {
        mReactViewRef = WeakReference(child)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        val rootView = FrameLayout(inflater.context)
        val reactView = mReactViewRef.get()
        if (reactView != null) {
            detachFromParent(reactView)
            rootView.addView(reactView, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }
        return rootView
    }

    fun getPosition(): Int {
        return mPosition
    }

    fun onReactViewUpdate(adapter: FragmentAdapter, positionDelta: Int): Boolean {
        mPosition += positionDelta
        val reactView = adapter.getViewAtPosition(mPosition)
        if (reactView == null || reactView === mReactViewRef.get()) {
            return false
        }
        mReactViewRef = WeakReference(reactView)
        val rootView = view as FrameLayout?
        if (rootView != null) {
            if (rootView.childCount > 0) {
                rootView.removeAllViews()
            }
            detachFromParent(reactView)
            rootView.addView(reactView, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }
        return true
    }

    private fun detachFromParent(view: View) {
        val parent = view.parent
        if (parent is FrameLayout) {
            parent.removeView(view)
        }
    }
}
