import type { NativeSyntheticEvent, ViewProps } from 'react-native';

export type OnPageScrollEventData = Readonly<{
  position: number;
  offset: number;
}>;

export type OnPageSelectedEventData = Readonly<{
  position: number;
}>;

export type OnPageScrollStateChangedEventData = Readonly<{
  pageScrollState: 'idle' | 'dragging' | 'settling';
}>;

export interface NativeProps extends ViewProps {
  scrollEnabled?: boolean;
  layoutDirection?: 'ltr' | 'rtl';
  initialPage?: number;
  orientation?: 'horizontal' | 'vertical';
  offscreenPageLimit?: number;
  pageMargin?: number;
  overScrollMode?: 'auto' | 'always' | 'never';
  overdrag?: boolean;
  keyboardDismissMode?: 'none' | 'on-drag';
  onPageScroll?: (event: NativeSyntheticEvent<OnPageScrollEventData>) => void;
  onPageSelected?: (
    event: NativeSyntheticEvent<OnPageSelectedEventData>
  ) => void;
  onPageScrollStateChanged?: (
    event: NativeSyntheticEvent<OnPageScrollStateChangedEventData>
  ) => void;
}

// No-op Commands — the web implementation uses useImperativeHandle instead
export const Commands = {
  setPage: () => {},
  setPageWithoutAnimation: () => {},
  setScrollEnabledImperatively: () => {},
};

// No-op default export — the web uses PagerView.web.tsx directly
export default null as any;
