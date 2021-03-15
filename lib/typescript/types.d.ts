/// <reference types="react" />
import type * as ReactNative from 'react-native';
export declare type TransitionStyle = 'scroll' | 'curl';
export declare type Orientation = 'horizontal' | 'vertical';
export declare type OverScrollMode = 'auto' | 'always' | 'never';
export declare type PageScrollState = 'idle' | 'dragging' | 'settling';
export declare type PagerViewOnPageScrollEvent = ReactNative.NativeSyntheticEvent<PagerViewOnPageScrollEventData>;
export interface PagerViewOnPageScrollEventData {
    position: number;
    offset: number;
}
export declare type PagerViewOnPageSelectedEvent = ReactNative.NativeSyntheticEvent<PagerViewOnPageSelectedEventData>;
export interface PagerViewOnPageSelectedEventData {
    position: number;
}
export declare type PageScrollStateChangedNativeEvent = ReactNative.NativeSyntheticEvent<PageScrollStateChangedEvent>;
export interface PageScrollStateChangedEvent {
    pageScrollState: PageScrollState;
}
export interface EagerPagerProps {
    /**
     * Index of initial page that should be selected. Use `setPage` method to
     * update the page, and `onPageSelected` to monitor page changes
     */
    initialPage?: number;
    /**
     * Determines whether the keyboard gets dismissed in response to a drag.
     *  - 'none' (the default), drags do not dismiss the keyboard.
     *  - 'on-drag', the keyboard is dismissed when a drag begins.
     */
    keyboardDismissMode?: 'none' | 'on-drag';
    /**
     * Set the number of pages that should be retained to either side of the
     * currently visible page(s). Pages beyond this limit will be recreated from
     * the adapter when needed.
     * Defaults to RecyclerView's caching strategy.
     * The given value must either be larger than 0.
     *
     * Android only.
     */
    offscreenPageLimit?: number;
    /**
     * Executed when transitioning between pages (ether because of animation for
     * the requested page change or when user is swiping/dragging between pages)
     * The `event.nativeEvent` object for this callback will carry following data:
     *  - position - index of first page from the left that is currently visible
     *  - offset - value from range [0,1) describing stage between page transitions.
     *    Value x means that (1 - x) fraction of the page at "position" index is
     *    visible, and x fraction of the next page is visible.
     */
    onPageScroll?: (event: PagerViewOnPageScrollEvent) => void;
    /**
     * This callback will be called once PagerView finish navigating to selected page
     * (when user swipes between pages). The `event.nativeEvent` object passed to this
     * callback will have following fields:
     *  - position - index of page that has been selected
     */
    onPageSelected?: (event: PagerViewOnPageSelectedEvent) => void;
    /**
     * Function called when the page scrolling state has changed.
     * The page scrolling state can be in 3 states:
     * - idle, meaning there is no interaction with the page scroller happening at the time
     * - dragging, meaning there is currently an interaction with the page scroller
     * - settling, meaning that there was an interaction with the page scroller, and the
     *   page scroller is now finishing it's closing or opening animation
     */
    onPageScrollStateChanged?: (event: PageScrollStateChangedNativeEvent) => void;
    /**
     * Orientation of pager.
     */
    orientation?: Orientation;
    /**
     * Determines whether it's possible to overscroll a bit
     * after reaching end or very beginning of pages.
     */
    overdrag?: boolean;
    /**
     * Blank space to show between pages. This is only visible while scrolling,
     * pages are still edge-to-edge.
     */
    pageMargin?: number;
    /**
     * When false, the content does not scroll.
     * The default value is true.
     */
    scrollEnabled?: boolean;
    /**
     * Shows the dots indicator at the bottom of the view.
     */
    showPageIndicator?: boolean;
    style?: ReactNative.StyleProp<ReactNative.ViewStyle>;
    /**
     * Transition style of pager.
     */
    transitionStyle?: TransitionStyle;
}
export interface PagerViewProps<ItemT> extends EagerPagerProps {
    /**
     * Number of pages to render before/after the current page. Minimum 1.
     */
    buffer?: number;
    /**
     * Array of data to be rendered as pages.
     */
    data: ItemT[];
    /**
     * Compute a unique key for the given item at the specified index.
     */
    keyExtractor: (item: ItemT, index: number) => string;
    /**
     * Maximum number of pages allowed to stay rendered. Set to 0 for unlimited.
     *
     * Default unlimited. Will always render at least `1 + 2 * buffer` pages.
     */
    maxRenderWindow?: number;
    /**
     * Render an item from `data` into a page.
     */
    renderItem: (info: {
        item: ItemT;
        index: number;
    }) => React.ReactElement;
}
export declare type PagerViewState = {
    offset: number;
    windowLength: number;
};
