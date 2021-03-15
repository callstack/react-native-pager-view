package com.reactnativepagerview

import android.view.View
import android.widget.FrameLayout
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter
import java.lang.ref.WeakReference
import java.util.*

class FragmentAdapter constructor(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
    private val mChildKeyToPosition = BiMap<String, Int>()
    private val mFragments = LinkedList<WeakReference<ViewPagerFragment>>()
    private val mReactChildrenViews = mutableListOf<View>()
    private val mUnprocessedChildKeys = mutableListOf<String>()
    private var count = 0
    private var offset = 0
    private var appliedCount = 0
    private var currentKey: String? = null
    private var currentPosition = 0
    private var currentTransactionId = 0

    override fun createFragment(position: Int): Fragment {
        val fragment = ViewPagerFragment(position, getViewAtPosition(position))
        mFragments.add(WeakReference(fragment))
        return fragment
    }

    override fun getItemCount(): Int {
        return count
    }

    override fun getItemId(position: Int): Long {
        val reactView = getViewAtPosition(position)
        return reactView?.id?.toLong() ?: super.getItemId(position)
    }

    override fun containsItem(itemId: Long): Boolean {
        for (reactView in mReactChildrenViews) {
            if (reactView.id.toLong() == itemId) {
                return true
            }
        }
        return super.containsItem(itemId)
    }

    fun setCount(count: Int) {
        this.count = count
    }

    fun setOffset(offset: Int) {
        this.offset = offset
    }

    fun getViewAtPosition(position: Int): View? {
        val index = position - offset
        return if (index >= 0 && index < mReactChildrenViews.size) mReactChildrenViews[index] else null
    }

    fun onPageSelected(position: Int) {
        currentKey = mChildKeyToPosition.getByValue(position)
        currentPosition = position
    }

    fun queueKeyToProcess(childKey: String) {
        mUnprocessedChildKeys.add(childKey)
    }

    private fun processChildKeys() {
        if (mUnprocessedChildKeys.isEmpty()) {
            return
        }
        mChildKeyToPosition.clear()
        for (i in mUnprocessedChildKeys.indices) {
            mChildKeyToPosition.put(mUnprocessedChildKeys[i], offset + i)
        }
        mUnprocessedChildKeys.clear()
    }

    fun getTransactionId() = currentTransactionId

    /**
     * Returns newly selected page index (if there was a change) or null.
     */
    fun onAfterUpdateTransaction(transactionId: Int): Int? {
        if (transactionId != currentTransactionId) {
            // Several sources may trigger this update; coalesce events.
            return null
        }
        currentTransactionId += 1
        processChildKeys()

        // Apply structural changes at the beginning of the pager.
        // Note that this may not be the optimal change set, but inaccurate
        // insert/delete locations will be later handled by notifyItemChanged().
        var newPosition: Int? = null
        if (currentKey != null) {
            newPosition = mChildKeyToPosition.getByKey(currentKey!!)
        }
        var delta = 0
        if (newPosition != null) {
            delta = newPosition - currentPosition
            if (delta < 0) {
                notifyItemRangeRemoved(0, -delta)
            } else if (delta > 0) {
                notifyItemRangeInserted(0, delta)
            }
        }

        // Apply structural changes at the end of the pager.
        appliedCount += delta
        if (appliedCount > count) {
            notifyItemRangeRemoved(count, appliedCount - count)
        } else if (appliedCount < count) {
            notifyItemRangeInserted(appliedCount, count - appliedCount)
        }
        appliedCount = count
        val it = mFragments.iterator()
        while (it.hasNext()) {
            val fragment = it.next().get()
            if (fragment == null) {
                it.remove()
            } else if (fragment.onReactViewUpdate(this, delta)) {
                val changedPos = fragment.getPosition()
                if (changedPos in 0 until count) {
                    notifyItemChanged(changedPos)
                }
            }
        }
        return if (newPosition == null || newPosition == currentPosition) null else newPosition
    }

    fun addReactView(child: View, index: Int) {
        mReactChildrenViews.add(index, child)
    }

    fun getReactChildAt(index: Int): View {
        return mReactChildrenViews[index]
    }

    fun getReactChildCount(): Int {
        return mReactChildrenViews.size
    }

    fun removeReactViewAt(index: Int) {
        val reactView = mReactChildrenViews.removeAt(index)
        val rootView = reactView.parent
        if (rootView is FrameLayout) {
            rootView.removeAllViews()
        }
    }
}
