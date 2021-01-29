import type * as ReactNative from 'react-native';

export type TransitionStyle = 'scroll' | 'curl';
export type Orientation = 'horizontal' | 'vertical';
export type OverScrollMode = 'auto' | 'always' | 'never';
export type PageScrollState = 'idle' | 'dragging' | 'settling';

export type ViewPagerOnPageScrollEvent = ReactNative.NativeSyntheticEvent<ViewPagerOnPageScrollEventData>;
export interface ViewPagerOnPageScrollEventData {
  position: number;
  offset: number;
}

export type ViewPagerOnPageSelectedEvent = ReactNative.NativeSyntheticEvent<ViewPagerOnPageSelectedEventData>;
export interface ViewPagerOnPageSelectedEventData {
  position: number;
}

export type PageScrollStateChangedNativeEvent = ReactNative.NativeSyntheticEvent<PageScrollStateChangedEvent>;
export interface PageScrollStateChangedEvent {
  pageScrollState: PageScrollState;
}

export interface ViewPagerProps<ItemT> {
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
   * Executed when transitioning between pages (ether because of animation for
   * the requested page change or when user is swiping/dragging between pages)
   * The `event.nativeEvent` object for this callback will carry following data:
   *  - position - index of first page from the left that is currently visible
   *  - offset - value from range [0,1) describing stage between page transitions.
   *    Value x means that (1 - x) fraction of the page at "position" index is
   *    visible, and x fraction of the next page is visible.
   */
  onPageScroll?: (event: ViewPagerOnPageScrollEvent) => void;

  /**
   * This callback will be called once ViewPager finish navigating to selected page
   * (when user swipes between pages). The `event.nativeEvent` object passed to this
   * callback will have following fields:
   *  - position - index of page that has been selected
   */
  onPageSelected?: (event: ViewPagerOnPageSelectedEvent) => void;

  /**
   * Orientation of pager.
   */
  orientation?: Orientation;

  /**
   * Render an item from `data` into a page.
   */
  renderItem: (info: { item: ItemT; index: number }) => React.ReactElement;

  /**
   * When false, the content does not scroll.
   * The default value is true.
   */
  scrollEnabled?: boolean;

  style?: ReactNative.StyleProp<ReactNative.ViewStyle>;
}

export type ViewPagerState = { offset: number; windowLength: number };
