import * as React from "react";
import * as ReactNative from "react-native";

export interface ViewPagerAndroidOnPageScrollEventData {
    position: number;
    offset: number;
}

export interface ViewPagerAndroidOnPageSelectedEventData {
    position: number;
}

export interface ViewPagerAndroidProps extends ReactNative.ViewProps {
    /**
     * Index of initial page that should be selected. Use `setPage` method to
     * update the page, and `onPageSelected` to monitor page changes
     */
    initialPage?: number;

    /**
     * When false, the content does not scroll.
     * The default value is true.
     */
    scrollEnabled?: boolean;

    /**
     * Executed when transitioning between pages (ether because of animation for
     * the requested page change or when user is swiping/dragging between pages)
     * The `event.nativeEvent` object for this callback will carry following data:
     *  - position - index of first page from the left that is currently visible
     *  - offset - value from range [0,1) describing stage between page transitions.
     *    Value x means that (1 - x) fraction of the page at "position" index is
     *    visible, and x fraction of the next page is visible.
     */
    onPageScroll?: (event: ReactNative.NativeSyntheticEvent<ViewPagerAndroidOnPageScrollEventData>) => void;

    /**
     * This callback will be called once ViewPager finish navigating to selected page
     * (when user swipes between pages). The `event.nativeEvent` object passed to this
     * callback will have following fields:
     *  - position - index of page that has been selected
     */
    onPageSelected?: (event: ReactNative.NativeSyntheticEvent<ViewPagerAndroidOnPageSelectedEventData>) => void;

    /**
     * Function called when the page scrolling state has changed.
     * The page scrolling state can be in 3 states:
     * - idle, meaning there is no interaction with the page scroller happening at the time
     * - dragging, meaning there is currently an interaction with the page scroller
     * - settling, meaning that there was an interaction with the page scroller, and the
     *   page scroller is now finishing it's closing or opening animation
     */
    onPageScrollStateChanged?: (state: "Idle" | "Dragging" | "Settling") => void;

    /**
     * Determines whether the keyboard gets dismissed in response to a drag.
     *   - 'none' (the default), drags do not dismiss the keyboard.
     *   - 'on-drag', the keyboard is dismissed when a drag begins.
     */
    keyboardDismissMode?: "none" | "on-drag";

    /**
     * Blank space to show between pages. This is only visible while scrolling, pages are still
     * edge-to-edge.
     */
    pageMargin?: number;
}

declare class ViewPagerAndroidComponent extends React.Component<ViewPagerAndroidProps> {}
declare const ViewPagerAndroidBase: ReactNative.Constructor<ReactNative.NativeMethodsMixin> & typeof ViewPagerAndroidComponent;
export default class ViewPagerAndroid extends ViewPagerAndroidBase {
    /**
     * A helper function to scroll to a specific page in the ViewPager.
     * The transition between pages will be animated.
     */
    public setPage(selectedPage: number): void;

    /**
     * A helper function to scroll to a specific page in the ViewPager.
     * The transition between pages will *not* be animated.
     */
    public setPageWithoutAnimation(selectedPage: number): void;
}
