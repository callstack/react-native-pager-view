package com.reactnativecommunity.viewpager;

import android.view.View;
import android.view.ViewParent;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

public class FragmentAdapter extends FragmentStateAdapter {
    private final BiMap<String, Integer> mChildKeyToPosition = new BiMap<>();
    private final List<WeakReference<ViewPagerFragment>> mFragments = new LinkedList<>();
    private final List<View> mReactChildrenViews = new ArrayList<>();
    private final List<String> mUnprocessedChildKeys = new ArrayList<>();
    private int count = 0;
    private int offset = 0;

    private int appliedCount = 0;
    private String currentKey = null;
    private int currentPosition = 0;

    private int currentTransactionId = 0;

    public FragmentAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        ViewPagerFragment fragment = new ViewPagerFragment(position, getViewAtPosition(position));
        mFragments.add(new WeakReference<>(fragment));
        return fragment;
    }

    @Override
    public int getItemCount() {
        return count;
    }

    @Override
    public long getItemId(int position) {
        View reactView = getViewAtPosition(position);
        return reactView == null ? super.getItemId(position) : reactView.getId();
    }

    @Override
    public boolean containsItem(long itemId) {
        for (View reactView : mReactChildrenViews) {
            if (reactView.getId() == itemId) {
                return true;
            }
        }
        return super.containsItem(itemId);
    }

    public void setCount(int count) {
        this.count = count;
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    @Nullable
    public View getViewAtPosition(int position) {
        int index = position - offset;
        return index >= 0 && index < mReactChildrenViews.size()
                ? mReactChildrenViews.get(index)
                : null;
    }

    public void onPageSelected(int position) {
        currentKey = mChildKeyToPosition.getByValue(position);
        currentPosition = position;
    }

    public void queueKeyToProcess(String childKey) {
        mUnprocessedChildKeys.add(childKey);
    }

    private void processChildKeys() {
        if (mUnprocessedChildKeys.isEmpty()) {
            return;
        }
        mChildKeyToPosition.clear();
        for (int i = 0; i < mUnprocessedChildKeys.size(); ++i) {
            mChildKeyToPosition.put(mUnprocessedChildKeys.get(i), offset + i);
        }
        mUnprocessedChildKeys.clear();
    }

    public int getTransactionId() {
        return currentTransactionId;
    }

    /**
     * Returns newly selected page index (if there was a change) or null.
     */
    public Integer onAfterUpdateTransaction(int transactionId) {
        if (transactionId != currentTransactionId) {
            // Several sources may trigger this update; coalesce events.
            return null;
        }
        currentTransactionId += 1;

        processChildKeys();

        // Apply structural changes at the beginning of the pager.
        // Note that this may not be the optimal change set, but inaccurate
        // insert/delete locations will be later handled by notifyItemChanged().
        Integer newPosition = null;
        if (currentKey != null) {
            newPosition = mChildKeyToPosition.getByKey(currentKey);
        }
        int delta = 0;
        if (newPosition != null) {
            delta = newPosition - currentPosition;
            if (delta < 0) {
                notifyItemRangeRemoved(0, -delta);
            } else if (delta > 0) {
                notifyItemRangeInserted(0, delta);
            }
        }

        // Apply structural changes at the end of the pager.
        appliedCount += delta;
        if (appliedCount > count) {
            notifyItemRangeRemoved(count, appliedCount - count);
        } else if (appliedCount < count) {
            notifyItemRangeInserted(appliedCount, count - appliedCount);
        }
        appliedCount = count;

        Iterator<WeakReference<ViewPagerFragment>> it = mFragments.iterator();
        while (it.hasNext()) {
            ViewPagerFragment fragment = it.next().get();
            if (fragment == null) {
                it.remove();
            } else if (fragment.onReactViewUpdate(this, delta)) {
                int changedPos = fragment.getPosition();
                if (changedPos >= 0 && changedPos < count) {
                    notifyItemChanged(changedPos);
                }
            }
        }

        return newPosition == null || newPosition == currentPosition ? null : newPosition;
    }

    public void addReactView(View child, int index) {
        mReactChildrenViews.add(index, child);
    }

    public View getReactChildAt(int index) {
        return mReactChildrenViews.get(index);
    }

    public int getReactChildCount() {
        return mReactChildrenViews.size();
    }

    public void removeReactViewAt(int index) {
        View reactView = mReactChildrenViews.remove(index);
        ViewParent rootView = reactView.getParent();
        if (rootView instanceof FrameLayout) {
            ((FrameLayout) rootView).removeAllViews();
        }
    }
}
