import { requireNativeComponent, StyleProp, ViewStyle } from 'react-native';
import type {
  Orientation,
  ViewPagerOnPageScrollEvent,
  ViewPagerOnPageSelectedEvent,
} from './types';

const VIEW_MANAGER_NAME = 'RNCViewPager';

type ViewPagerNativeProps = {
  count: number;
  offset: number;
  onPageScroll?: (event: ViewPagerOnPageScrollEvent) => void;
  onPageSelected: (event: ViewPagerOnPageSelectedEvent) => void;
  orientation?: Orientation;
  scrollEnabled?: boolean;
  style: StyleProp<ViewStyle>;
};

export const ViewPagerNative = requireNativeComponent<ViewPagerNativeProps>(
  VIEW_MANAGER_NAME
);
