import type * as ReactNative from 'react-native';
import { PagerView } from './PagerView';
export default PagerView;
export * from './usePagerView';

import type {
  OnPageScrollEventData as PagerViewOnPageScrollEventData,
  OnPageSelectedEventData as PagerViewOnPageSelectedEventData,
  OnPageScrollStateChangedEventData as PageScrollStateChangedNativeEventData,
} from './PagerViewNativeComponent';

export type {
  PagerViewOnPageScrollEventData,
  PagerViewOnPageSelectedEventData,
  PageScrollStateChangedNativeEventData,
};
export type { PagerViewProps } from './PagerView';

export type PagerViewOnPageScrollEvent =
  ReactNative.NativeSyntheticEvent<PagerViewOnPageScrollEventData>;

export type PagerViewOnPageSelectedEvent =
  ReactNative.NativeSyntheticEvent<PagerViewOnPageSelectedEventData>;

export type PageScrollStateChangedNativeEvent =
  ReactNative.NativeSyntheticEvent<PageScrollStateChangedNativeEventData>;
