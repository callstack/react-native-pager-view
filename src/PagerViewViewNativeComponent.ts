import type * as React from 'react';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type {
  BubblingEventHandler,
  DirectEventHandler,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import type {
  Orientation,
  OverScrollMode,
  PagerViewOnPageScrollEventData,
  PagerViewOnPageSelectedEventData,
  PageScrollStateChangedEvent,
} from './types';

const VIEW_MANAGER_NAME = 'PagerViewView';

interface NativeProps extends ViewProps {
  scrollEnabled?: WithDefault<boolean, true>;
  layoutDirection?: 'rtl' | 'ltr' | 'locale';
  initialPage?: Int32;
  orientation?: Orientation;
  offscreenPageLimit?: Int32;
  pageMargin?: Int32;
  overScrollMode?: OverScrollMode;
  onPageScroll: BubblingEventHandler<PagerViewOnPageScrollEventData>;
  onPageSelected: DirectEventHandler<PagerViewOnPageSelectedEventData>;
  onPageScrollStateChanged: DirectEventHandler<PageScrollStateChangedEvent>;
}

type PagerViewViewType = HostComponent<NativeProps>;

export interface NativeCommands {
  setPage: (
    viewRef: React.ElementRef<PagerViewViewType>,
    selectedPage: number
  ) => void;
  setPageWithoutAnimation: (
    viewRef: React.ElementRef<PagerViewViewType>,
    selectedPage: number
  ) => void;
  setScrollEnabled: (
    viewRef: React.ElementRef<PagerViewViewType>,
    scrollEnabled: boolean
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setPage', 'setPageWithoutAnimation', 'setScrollEnabled'],
});

export default codegenNativeComponent<NativeProps>(
  VIEW_MANAGER_NAME
) as HostComponent<NativeProps>;
