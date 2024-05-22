/*
  Note: The types below are duplicated between this file and `src/specs/PagerViewNativeComponent.ts`.

  This is on purpose. Firstly, we're declaring two native modules with two different iOS implementation flavors, but the same API.
  Secondly, as these files serve as a reference point for React Native's new architecture Codegen process (which takes care of the
  automatic generation of the native modules) we cannot extract the types into a separate file, or declare both native modules
  in one file, as Codegen supports neither of these workarounds at the time of writing.

  In order to make things as intuitive as possible, the duplicated types in this file are *not* exported, as they are meant for use
  in this file only, by Codegen-related functions.
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
  useLegacy?: WithDefault<boolean, true>;
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

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'setPage',
    'setPageWithoutAnimation',
    'setScrollEnabledImperatively',
  ],
});

export default codegenNativeComponent<NativeProps>(
  'LEGACY_RNCViewPager'
) as HostComponent<NativeProps>;
