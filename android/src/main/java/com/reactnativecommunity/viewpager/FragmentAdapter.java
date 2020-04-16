package com.reactnativecommunity.viewpager;

import android.view.View;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;


import com.reactnative.community.viewpager2.adapter.FragmentStateAdapter;

import java.util.ArrayList;

public class FragmentAdapter extends FragmentStateAdapter {

    public FragmentAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    private ArrayList<ViewPagerFragment> children = new ArrayList<>();

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        return children.get(position);
    }

    @Override
    public int getItemCount() {
        return children.size();
    }

    public void addFragment(View child, int index) {
        children.add(ViewPagerFragment.newInstance(child.getId()));
        notifyDataSetChanged();
    }


    public void removeFragment(View child) {
        for (int i = 0; i < children.size(); i++) {
            Fragment fragment = children.get(i);
            if (fragment.getId() == child.getId()) {
                children.remove(i);
                notifyItemRemoved(i);
                return;
            }
        }
    }

    public void removeFragmentAt(int index) {
        children.remove(index);
        notifyItemRemoved(index);
    }

    public View getChildAt(int index) {
        return children.get(index).getView();
    }
}
