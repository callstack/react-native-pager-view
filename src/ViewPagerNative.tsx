import { requireNativeComponent, StyleProp, ViewStyle } from 'react-native';
import type { ViewPagerOnPageSelectedEvent } from './types';

const VIEW_MANAGER_NAME = 'RNCViewPager';

type ViewPagerNativeProps = {
  count: number;
  offset: number;
  onPageSelected: (event: ViewPagerOnPageSelectedEvent) => void;
  style: StyleProp<ViewStyle>;
};

export const ViewPagerNative = requireNativeComponent<ViewPagerNativeProps>(
  VIEW_MANAGER_NAME
);
