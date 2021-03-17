import {
  GestureResponderEvent,
  requireNativeComponent,
  StyleProp,
  UIManager,
  ViewStyle,
} from 'react-native';
import type {
  Orientation,
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
  TransitionStyle,
} from './types';

const VIEW_MANAGER_NAME = 'RNCViewPager';

type PagerViewNativeProps = {
  childrenKeys: string[];
  count: number;
  offscreenPageLimit?: number;
  offset: number;
  onMoveShouldSetResponderCapture: (event: GestureResponderEvent) => boolean;
  onPageScroll?: (event: PagerViewOnPageScrollEvent) => void;
  onPageScrollStateChanged?: (event: PageScrollStateChangedNativeEvent) => void;
  onPageSelected?: (event: PagerViewOnPageSelectedEvent) => void;
  orientation?: Orientation;
  overdrag?: boolean;
  pageMargin?: number;
  scrollEnabled?: boolean;
  showPageIndicator?: boolean;
  style: StyleProp<ViewStyle>;
  transitionStyle?: TransitionStyle;
};

export const PagerViewViewManager = requireNativeComponent<PagerViewNativeProps>(
  VIEW_MANAGER_NAME
);

export function getViewManagerConfig(viewManagerName = VIEW_MANAGER_NAME) {
  return UIManager.getViewManagerConfig(viewManagerName);
}
