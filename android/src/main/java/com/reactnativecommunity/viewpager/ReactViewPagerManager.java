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

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.reactnativecommunity.viewpager.event.PageScrollEvent;
import com.reactnativecommunity.viewpager.event.PageScrollStateChangedEvent;
import com.reactnativecommunity.viewpager.event.PageSelectedEvent;

import java.util.Map;

import static androidx.viewpager2.widget.ViewPager2.ORIENTATION_HORIZONTAL;
import static androidx.viewpager2.widget.ViewPager2.ORIENTATION_VERTICAL;
import static androidx.viewpager2.widget.ViewPager2.SCROLL_STATE_DRAGGING;
import static androidx.viewpager2.widget.ViewPager2.SCROLL_STATE_IDLE;
import static androidx.viewpager2.widget.ViewPager2.SCROLL_STATE_SETTLING;

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
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
                eventDispatcher.dispatchEvent(
                        new PageScrollEvent(vp.getId(), position, positionOffset));
            }

            @Override
            public void onPageSelected(int position) {
                eventDispatcher.dispatchEvent(
                        new PageSelectedEvent(vp.getId(), position));
            }

            @Override
            public void onPageScrollStateChanged(int state) {
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
                PageScrollEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScroll"),
                PageScrollStateChangedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageScrollStateChanged"),
                PageSelectedEvent.EVENT_NAME, MapBuilder.of("registrationName", "onPageSelected"));
    }

    @Override
    protected void onAfterUpdateTransaction(@NonNull ViewPager2 view) {
        super.onAfterUpdateTransaction(view);
        ((FragmentAdapter) view.getAdapter()).onAfterUpdateTransaction();
    }

    @Override
    public void receiveCommand(@NonNull ViewPager2 view, String commandId, @Nullable ReadableArray args) {
        if ("setPage".equals(commandId) && args != null) {
            setCurrentItem(view, args.getInt(0), args.getBoolean(1));
            return;
        } else if ("setScrollEnabled".equals(commandId) && args != null) {
            view.setUserInputEnabled(args.getBoolean(0));
            return;
        }
        throw new IllegalArgumentException(String.format(
                "Unsupported command %s received by %s.",
                commandId,
                getClass().getSimpleName()));
    }

    @ReactProp(name = "count")
    public void setCount(ViewPager2 view, int count) {
        ((FragmentAdapter) view.getAdapter()).setCount(count);
    }

    @ReactProp(name = "offscreenPageLimit", defaultInt = ViewPager2.OFFSCREEN_PAGE_LIMIT_DEFAULT)
    public void setOffscreenPageLimit(ViewPager2 view, int limit) {
        view.setOffscreenPageLimit(limit);
    }

    @ReactProp(name = "offset")
    public void setOffset(ViewPager2 view, int offset) {
        ((FragmentAdapter) view.getAdapter()).setOffset(offset);
    }

    @ReactProp(name = "orientation")
    public void setOrientation(ViewPager2 view, String orientation) {
        view.setOrientation("vertical".equals(orientation) ? ORIENTATION_VERTICAL : ORIENTATION_HORIZONTAL);
    }

    @ReactProp(name = "overdrag", defaultBoolean = true)
    public void setOverdrag(ViewPager2 view, boolean overdrag) {
        view.getChildAt(0).setOverScrollMode(overdrag
                ? ViewPager2.OVER_SCROLL_IF_CONTENT_SCROLLS
                : ViewPager2.OVER_SCROLL_NEVER
        );
    }

    @ReactProp(name = "pageMargin", defaultFloat = 0)
    public void setPageMargin(ViewPager2 view, float margin) {
        final int pageMargin = (int) PixelUtil.toPixelFromDIP(margin);
        final ViewPager2 vp = view;

        // Don't use MarginPageTransformer to be able to support negative margins.
        view.setPageTransformer(new ViewPager2.PageTransformer() {
            @Override
            public void transformPage(@NonNull View page, float position) {
                float offset = pageMargin * position;

                if (vp.getOrientation() == ViewPager2.ORIENTATION_HORIZONTAL) {
                    boolean isRTL = vp.getLayoutDirection() == View.LAYOUT_DIRECTION_RTL;

                    page.setTranslationX(isRTL ? -offset : offset);
                } else {
                    page.setTranslationY(offset);
                }
            }
        });
    }

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    public void setScrollEnabled(ViewPager2 view, boolean enabled) {
        view.setUserInputEnabled(enabled);
    }

    private void setCurrentItem(final ViewPager2 view, int item, boolean smoothScroll) {
        view.post(new Runnable() {
            @Override
            public void run() {
                view.measure(
                        View.MeasureSpec.makeMeasureSpec(view.getWidth(), View.MeasureSpec.EXACTLY),
                        View.MeasureSpec.makeMeasureSpec(view.getHeight(), View.MeasureSpec.EXACTLY));
                view.layout(view.getLeft(), view.getTop(), view.getRight(), view.getBottom());
            }
        });
        view.setCurrentItem(item, smoothScroll);
    }
}
