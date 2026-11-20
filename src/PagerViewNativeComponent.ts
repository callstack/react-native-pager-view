import type * as React from 'react';
import { codegenNativeCommands, codegenNativeComponent } from 'react-native';
import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';

export type OnPageScrollEventData = Readonly<{
  position: CodegenTypes.Double;
  offset: CodegenTypes.Double;
}>;

export type OnPageSelectedEventData = Readonly<{
  position: CodegenTypes.Double;
}>;

export type OnPageScrollStateChangedEventData = Readonly<{
  pageScrollState: 'idle' | 'dragging' | 'settling';
}>;

export interface NativeProps extends ViewProps {
  scrollEnabled?: CodegenTypes.WithDefault<boolean, true>;
  layoutDirection?: CodegenTypes.WithDefault<'ltr' | 'rtl', 'ltr'>;
  initialPage?: CodegenTypes.Int32;
  orientation?: CodegenTypes.WithDefault<
    'horizontal' | 'vertical',
    'horizontal'
  >;
  offscreenPageLimit?: CodegenTypes.Int32;
  pageMargin?: CodegenTypes.Int32;
  overScrollMode?: CodegenTypes.WithDefault<
    'auto' | 'always' | 'never',
    'auto'
  >;
  overdrag?: CodegenTypes.WithDefault<boolean, false>;
  /**
   * iOS only. Lets a pan gesture inside a page take a horizontal drag that
   * starts on it — a swipeable row, a slider, a swipe to reply — while a drag
   * that starts anywhere else still pages. As its pan would start, the pager
   * declines the drag if a pan recognizer on the view the touch landed on, or
   * on one of that view's ancestors inside the page, is still tracking it; one
   * that has already failed leaves it to the pager. The decision holds for the
   * rest of the touch. Only `UIPanGestureRecognizer`s
   * count (react-native-gesture-handler's, not `PanResponder`), and scroll
   * views' own pans don't, so a vertical list in a page doesn't stop it paging.
   */
  yieldToNestedGestures?: CodegenTypes.WithDefault<boolean, false>;
  keyboardDismissMode?: CodegenTypes.WithDefault<'none' | 'on-drag', 'none'>;
  onPageScroll?: CodegenTypes.DirectEventHandler<OnPageScrollEventData>;
  onPageSelected?: CodegenTypes.DirectEventHandler<OnPageSelectedEventData>;
  onPageScrollStateChanged?: CodegenTypes.DirectEventHandler<OnPageScrollStateChangedEventData>;
}

type PagerViewViewType = HostComponent<NativeProps>;

export interface NativeCommands {
  setPage: (
    viewRef: React.ComponentRef<PagerViewViewType>,
    selectedPage: CodegenTypes.Int32,
    animation: string
  ) => void;
  setPageWithoutAnimation: (
    viewRef: React.ComponentRef<PagerViewViewType>,
    selectedPage: CodegenTypes.Int32
  ) => void;
  setScrollEnabledImperatively: (
    viewRef: React.ComponentRef<PagerViewViewType>,
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
  'RNCViewPager'
) as HostComponent<NativeProps>;
