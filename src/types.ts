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
   * Render an item from `data` into a page.
   */
  renderItem: (info: { item: ItemT; index: number }) => React.ReactElement;

  style?: ReactNative.StyleProp<ReactNative.ViewStyle>;
}

export type ViewPagerState = { offset: number; windowLength: number };
