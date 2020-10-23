/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.reactnativecommunity.viewpager;

import java.util.Map;

import android.view.View;

import androidx.viewpager.widget.ViewPager;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import com.facebook.react.uimanager.events.EventDispatcher;
import com.reactnative.community.viewpager2.widget.MarginPageTransformer;
import com.reactnative.community.viewpager2.widget.ViewPager2;
import com.reactnativecommunity.viewpager.event.PageScrollEvent;
import com.reactnativecommunity.viewpager.event.PageScrollStateChangedEvent;
import com.reactnativecommunity.viewpager.event.PageSelectedEvent;

import javax.annotation.Nullable;

/**
 * Instance of {@link com.facebook.react.uimanager.ViewManager} that provides native {@link android.support.v4.view.ViewPager} view.
 */
public class ReactViewPagerManager extends ViewGroupManager<ReactViewPager> {

    private static final String REACT_CLASS = "RNCViewPager";

    private static final int COMMAND_SET_PAGE = 1;
    private static final int COMMAND_SET_PAGE_WITHOUT_ANIMATION = 2;
    private static final int COMMAND_SET_SCROLL_ENABLED = 3;

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected ViewPager2 createViewInstance(@NonNull ThemedReactContext reactContext) {
        final ViewPager2 vp = new ViewPager2(reactContext);
        FragmentAdapter adapter = new FragmentAdapter((FragmentActivity) reactContext.getCurrentActivity());
        vp.setAdapter(adapter);
        eventDispatcher = reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
        vp.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
                super.onPageScrolled(position, positionOffset, positionOffsetPixels);
                eventDispatcher.dispatchEvent(
                        new PageScrollEvent(vp.getId(), position, positionOffset));
            }

            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                eventDispatcher.dispatchEvent(
                        new PageSelectedEvent(vp.getId(), position));
            }

            @Override
            public void onPageScrollStateChanged(int state) {
                super.onPageScrollStateChanged(state);
                String pageScrollState;
                switch (state) {
                    case SCROLL_STATE_IDLE:
                        pageScrollState = "idle";
                        break;
                    case SCROLL_STATE_DRAGGING:
                        pageScrollState = "dragging";
                        break;
                    case SCROLL_STATE_SETTLING:
                        pageScrollState = "settling";
                        break;
                    default:
                        throw new IllegalStateException("Unsupported pageScrollState");
                }
                eventDispatcher.dispatchEvent(
                        new PageScrollStateChangedEvent(vp.getId(), pageScrollState));
            }
        });
        return vp;
    }

    @Override
    public void addView(ViewPager2 parent, View child, int index) {
        if (child == null) {
            return;
        }
        reactChildrenViews.put(child.getId(), child);
        ((FragmentAdapter) parent.getAdapter()).addFragment(child, index);
    }

    @Override
    public int getChildCount(ViewPager2 parent) {
        return parent.getAdapter().getItemCount();
    }


    @Override
    public View getChildAt(ViewPager2 parent, int index) {
        return reactChildrenViews.get(((FragmentAdapter) parent.getAdapter()).getChildViewIDAt(index));
    }

    @Override
    public void removeView(ViewPager2 parent, View view) {
        reactChildrenViews.remove(view.getId());
        ((FragmentAdapter) parent.getAdapter()).removeFragment(view);
    }


    public void removeAllViews(ViewPager2 parent) {
        FragmentAdapter adapter = ((FragmentAdapter) parent.getAdapter());
        for (int childID : adapter.getChildrenViewIDs()) {
            reactChildrenViews.remove(childID);
        }
        adapter.removeAll();
        parent.setAdapter(null);
    }

    @Override
    protected ReactViewPager createViewInstance(ThemedReactContext reactContext) {
        return new ReactViewPager(reactContext);
    }

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    public void setScrollEnabled(ReactViewPager viewPager, boolean value) {
        viewPager.setScrollEnabled(value);
    }

    @ReactProp(name = "orientation")
    public void setOrientation(ReactViewPager viewPager, String value) {
        viewPager.setOrientation(value.equals("vertical"));
    }

    @ReactProp(name = "overScrollMode")
    public void setOverScrollMode(ReactViewPager viewPager, String value) {
        if (value.equals("never")) {
            viewPager.setOverScrollMode(ViewPager.OVER_SCROLL_NEVER);
        } else if (value.equals("always")) {
            viewPager.setOverScrollMode(ViewPager.OVER_SCROLL_ALWAYS);
        } else {
            viewPager.setOverScrollMode(ViewPager.OVER_SCROLL_IF_CONTENT_SCROLLS);
        }
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                PageScrollEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScroll"),
                PageScrollStateChangedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScrollStateChanged"),
                PageSelectedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageSelected"));
    }

    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "setPage",
                COMMAND_SET_PAGE,
                "setPageWithoutAnimation",
                COMMAND_SET_PAGE_WITHOUT_ANIMATION,
                "setScrollEnabled",
                COMMAND_SET_SCROLL_ENABLED);
    }

    @Override
    public void receiveCommand(
            ReactViewPager viewPager,
            int commandType,
            @Nullable ReadableArray args) {
        Assertions.assertNotNull(viewPager);
        Assertions.assertNotNull(args);
        switch (commandType) {
            case COMMAND_SET_PAGE: {
                viewPager.setCurrentItemFromJs(args.getInt(0), true);
                return;
            }
            case COMMAND_SET_PAGE_WITHOUT_ANIMATION: {
                viewPager.setCurrentItemFromJs(args.getInt(0), false);
                return;
            }
            case COMMAND_SET_SCROLL_ENABLED: {
                viewPager.setScrollEnabled(args.getBoolean(0));
                return;
            }
            default:
                throw new IllegalArgumentException(String.format(
                        "Unsupported command %d received by %s.",
                        commandType,
                        getClass().getSimpleName()));
        }
    }

    @Override
    public void addView(ReactViewPager parent, View child, int index) {
        parent.addViewToAdapter(child, index);
    }

    @Override
    public int getChildCount(ReactViewPager parent) {
        return parent.getViewCountInAdapter();
    }

    @Override
    public View getChildAt(ReactViewPager parent, int index) {
        return parent.getViewFromAdapter(index);
    }

    @Override
    public void removeViewAt(ReactViewPager parent, int index) {
        parent.removeViewFromAdapter(index);
    }

    @ReactProp(name = "pageMargin", defaultFloat = 0)
    public void setPageMargin(ViewPager2 pager, float margin) {
        int pageMargin = (int) PixelUtil.toPixelFromDIP(margin);
        pager.setPageTransformer(new MarginPageTransformer(pageMargin));
    }
}