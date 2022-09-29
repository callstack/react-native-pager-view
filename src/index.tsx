import type * as ReactNative from 'react-native';
import { PagerView } from './PagerView';
export default PagerView;

import type {
  OnPageScrollEventData as PagerViewOnPageScrollEventData,
  OnPageSelectedEventData as PagerViewOnPageSelectedEventData,
  OnPageScrollStateChangedEventData as PageScrollStateChangedNativeEventData,
  NativeProps,
} from './PagerViewNativeComponent';

interface PagerViewProps extends NativeProps {
  // TODO do we still need this ?
  showPageIndicator?: boolean;
}

export type {
  PagerViewOnPageScrollEventData,
  PagerViewOnPageSelectedEventData,
  PageScrollStateChangedNativeEventData,
  PagerViewProps,
};

export type PagerViewOnPageScrollEvent =
  ReactNative.NativeSyntheticEvent<PagerViewOnPageScrollEventData>;

export type PagerViewOnPageSelectedEvent =
  ReactNative.NativeSyntheticEvent<PagerViewOnPageSelectedEventData>;

export type PageScrollStateChangedNativeEvent =
  ReactNative.NativeSyntheticEvent<PageScrollStateChangedNativeEventData>;
