package com.reactnativecommunity.viewpager;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;

public class ViewPagerFragment extends Fragment {
    private final View view;

    public ViewPagerFragment(View child) {
        view = child;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        if (view == null) {
            return new View(inflater.getContext());
        } else {
            ViewGroup.LayoutParams params = view.getLayoutParams();
            if (params == null) {
                params = new ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT);
            } else {
                params.width = MATCH_PARENT;
                params.height = MATCH_PARENT;
            }
            view.setLayoutParams(params);
            return view;
        }
    }
}
