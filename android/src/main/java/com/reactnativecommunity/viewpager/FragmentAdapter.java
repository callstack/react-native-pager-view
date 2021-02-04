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
    private final List<WeakReference<ViewPagerFragment>> mFragments = new LinkedList<>();
    private final List<View> mReactChildrenViews = new ArrayList<>();
    public int count = 0;
    public int offset = 0;

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

    @Nullable
    public View getViewAtPosition(int position) {
        int index = position - offset;
        return index >= 0 && index < mReactChildrenViews.size()
                ? mReactChildrenViews.get(index)
                : null;
    }

    public void onAfterUpdateTransaction() {
        Iterator<WeakReference<ViewPagerFragment>> it = mFragments.iterator();
        while (it.hasNext()) {
            ViewPagerFragment fragment = it.next().get();
            if (fragment == null) {
                it.remove();
            } else if (fragment.onReactViewUpdate(this)) {
                notifyItemChanged(fragment.getPosition());
            }
        }
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
