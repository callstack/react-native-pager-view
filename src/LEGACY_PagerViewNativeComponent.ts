/*
  TODO: A comment describing the purpose of this file **and why the types are duplicated between here and `PagerViewNativeComponent.tsx`**
*/
import type * as React from 'react';
import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type {
  DirectEventHandler,
  Double,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type OnPageScrollEventData = Readonly<{
  position: Double;
  offset: Double;
}>;

type OnPageSelectedEventData = Readonly<{
  position: Double;
}>;

type OnPageScrollStateChangedEventData = Readonly<{
  pageScrollState: 'idle' | 'dragging' | 'settling';
}>;

interface NativeProps extends ViewProps {
  scrollEnabled?: WithDefault<boolean, true>;
  layoutDirection?: WithDefault<'ltr' | 'rtl', 'ltr'>;
  initialPage?: Int32;
  orientation?: WithDefault<'horizontal' | 'vertical', 'horizontal'>;
  offscreenPageLimit?: Int32;
  pageMargin?: Int32;
  overScrollMode?: WithDefault<'auto' | 'always' | 'never', 'auto'>;
  overdrag?: WithDefault<boolean, false>;
  keyboardDismissMode?: WithDefault<'none' | 'on-drag', 'none'>;
  onPageScroll?: DirectEventHandler<OnPageScrollEventData>;
  onPageSelected?: DirectEventHandler<OnPageSelectedEventData>;
  onPageScrollStateChanged?: DirectEventHandler<OnPageScrollStateChangedEventData>;
  useLegacy?: WithDefault<boolean, false>;
}

type PagerViewViewType = HostComponent<NativeProps>;

interface NativeCommands {
  setPage: (
    viewRef: React.ElementRef<PagerViewViewType>,
    selectedPage: Int32
  ) => void;
  setPageWithoutAnimation: (
    viewRef: React.ElementRef<PagerViewViewType>,
    selectedPage: Int32
  ) => void;
  setScrollEnabledImperatively: (
    viewRef: React.ElementRef<PagerViewViewType>,
    scrollEnabled: boolean
  ) => void;
}

export const LEGACY_PagerViewNativeCommands: NativeCommands =
  codegenNativeCommands<NativeCommands>({
    supportedCommands: [
      'setPage',
      'setPageWithoutAnimation',
      'setScrollEnabledImperatively',
    ],
  });

export default codegenNativeComponent<NativeProps>(
  'LEGACY_RNCViewPager'
) as HostComponent<NativeProps>;
