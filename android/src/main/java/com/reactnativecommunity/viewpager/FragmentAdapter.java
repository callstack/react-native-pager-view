package com.reactnativecommunity.viewpager;

import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class FragmentAdapter extends FragmentStateAdapter {
    private final List<View> mReactChildrenViews = new ArrayList<>();
    public int count = 0;
    public int offset = 0;
    private int mPrevOffset = 0;
    private int mPrevReactChildrenCount = 0;

    public FragmentAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        return new ViewPagerFragment(getViewAtPosition(position));
    }

    @Override
    public int getItemCount() {
        return count;
    }

    @Nullable
    private View getViewAtPosition(int position) {
        int index = position - offset;
        return index >= 0 && index < mReactChildrenViews.size()
                ? mReactChildrenViews.get(index)
                : null;
    }

    public void onAfterUpdateTransaction() {
        Set<Integer> changedPositions = new HashSet<>(mReactChildrenViews.size());
        for (int i = 0; i < mReactChildrenViews.size(); ++i) {
            changedPositions.add(offset + i);
        }
        int bound = Math.min(count, mPrevOffset + mPrevReactChildrenCount);
        for (int position = mPrevOffset; position < bound; ++position) {
            if (changedPositions.contains(position)) {
                changedPositions.remove(position);
            } else {
                changedPositions.add(position);
            }
        }

        // Let the ViewPager2 know which pages need to be updated. These are the
        // pages that are now available from JS-side, and the pages that were just
        // unmounted from JS-side.
        // TODO: Currently assumes no pages will be inserted/deleted at an index
        // before the currently displayed page.
        for (int position : changedPositions) {
            notifyItemChanged(position);
        }

        mPrevOffset = offset;
        mPrevReactChildrenCount = mReactChildrenViews.size();
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
        mReactChildrenViews.remove(index);
    }
}
