package com.reactnativecommunity.viewpager;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import java.lang.ref.WeakReference;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;

public class ViewPagerFragment extends Fragment {
    private final int mPosition;
    private WeakReference<View> mReactViewRef;

    public ViewPagerFragment(int position, View child) {
        mPosition = position;
        mReactViewRef = new WeakReference<>(child);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        FrameLayout rootView = new FrameLayout(inflater.getContext());
        View reactView = mReactViewRef.get();
        if (reactView != null) {
            ViewParent previousParent = reactView.getParent();
            if (previousParent instanceof FrameLayout) {
                ((FrameLayout) previousParent).removeAllViews();
            }
            rootView.addView(reactView, MATCH_PARENT, MATCH_PARENT);
        }
        return rootView;
    }

    public int getPosition() {
        return mPosition;
    }

    public boolean onReactViewUpdate(FragmentAdapter adapter) {
        View reactView = adapter.getViewAtPosition(mPosition);
        if (reactView == null || reactView == mReactViewRef.get()) {
            return false;
        }
        mReactViewRef = new WeakReference<>(reactView);
        FrameLayout rootView = (FrameLayout) getView();
        if (rootView != null) {
            if (rootView.getChildCount() > 0) {
                rootView.removeAllViews();
            }
            rootView.addView(reactView, MATCH_PARENT, MATCH_PARENT);
        }
        return true;
    }
}
