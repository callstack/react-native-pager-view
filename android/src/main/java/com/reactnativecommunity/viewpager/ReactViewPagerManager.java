/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * <p>
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.reactnativecommunity.viewpager;

import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.widget.ViewPager2;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.reactnativecommunity.viewpager.event.PageSelectedEvent;

import java.util.Map;

public class ReactViewPagerManager extends ViewGroupManager<ViewPager2> {

    private static final String REACT_CLASS = "RNCViewPager";
    private EventDispatcher eventDispatcher;

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected ViewPager2 createViewInstance(@NonNull ThemedReactContext reactContext) {
        final ViewPager2 vp = new ViewPager2(reactContext);
        final FragmentAdapter adapter = new FragmentAdapter((FragmentActivity) reactContext.getCurrentActivity());
        vp.setAdapter(adapter);
        eventDispatcher = reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
        vp.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                eventDispatcher.dispatchEvent(
                        new PageSelectedEvent(vp.getId(), position));
            }
        });
        return vp;
    }

    @Override
    public void addView(ViewPager2 parent, View child, int index) {
        final FragmentAdapter adapter = (FragmentAdapter) parent.getAdapter();
        adapter.addReactView(child, index);
        parent.post(new Runnable() {
            @Override
            public void run() {
                adapter.onAfterUpdateTransaction();
            }
        });
    }

    @Override
    public int getChildCount(ViewPager2 parent) {
        return ((FragmentAdapter) parent.getAdapter()).getReactChildCount();
    }

    @Override
    public View getChildAt(ViewPager2 parent, int index) {
        return ((FragmentAdapter) parent.getAdapter()).getReactChildAt(index);
    }

    @Override
    public void removeViewAt(ViewPager2 parent, int index) {
        final FragmentAdapter adapter = (FragmentAdapter) parent.getAdapter();
        adapter.removeReactViewAt(index);
        parent.post(new Runnable() {
            @Override
            public void run() {
                adapter.onAfterUpdateTransaction();
            }
        });
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>of(
                PageSelectedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageSelected"));
    }

    @Override
    protected void onAfterUpdateTransaction(@NonNull ViewPager2 view) {
        super.onAfterUpdateTransaction(view);
        ((FragmentAdapter) view.getAdapter()).onAfterUpdateTransaction();
    }

    @ReactProp(name = "count")
    public void setCount(ViewPager2 view, int count) {
        ((FragmentAdapter) view.getAdapter()).count = count;
    }

    @ReactProp(name = "offset")
    public void setOffset(ViewPager2 view, int offset) {
        ((FragmentAdapter) view.getAdapter()).offset = offset;
    }
}
