import { requireNativeComponent, UIManager } from 'react-native';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import type {
  Orientation,
  OverScrollMode,
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
  TransitionStyle,
} from './types';

const VIEW_MANAGER_NAME = 'RNCViewPager';

type PagerViewNativeProps = {
  offscreenPageLimit?: number;

  /**
   * If a parent `View` wants to prevent a child `View` from becoming responder
   * on a move, it should have this handler which returns `true`.
   *
   * `View.props.onMoveShouldSetResponderCapture: (event) => [true | false]`,
   * where `event` is a synthetic touch event as described above.
   *
   * See http://facebook.github.io/react-native/docs/view.html#onMoveShouldsetrespondercapture
   */
  onMoveShouldSetResponderCapture: (event: GestureResponderEvent) => boolean;
  onPageScroll: (event: PagerViewOnPageScrollEvent) => void;
  onPageScrollStateChanged: (event: PageScrollStateChangedNativeEvent) => void;
  onPageSelected: (event: PagerViewOnPageSelectedEvent) => void;
  orientation?: Orientation;
  overdrag?: boolean;
  overScrollMode?: OverScrollMode;
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
