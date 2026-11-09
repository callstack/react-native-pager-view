import React, { useImperativeHandle, useRef } from 'react';
import { I18nManager, Keyboard, Platform } from 'react-native';
import type * as ReactNative from 'react-native';

import { childrenWithOverriddenStyle } from './utils';

import PagerViewNativeComponent, {
  Commands as PagerViewNativeCommands,
  type OnPageScrollStateChangedEventData,
  type NativeProps,
} from './PagerViewNativeComponent';

export type SetPageOptions = {
  /**
   * `'scroll'` scrolls past every page between the current one and the target.
   * `'direct'` slides the target in next to the current page, as if they were
   * neighbours. Defaults to `'scroll'`.
   */
  animation?: 'scroll' | 'direct';
};

export type PagerViewMethods = {
  /**
   * A helper function to scroll to a specific page in the PagerView.
   * The transition between pages will be animated.
   */
  setPage: (selectedPage: number, options?: SetPageOptions) => void;
  /**
   * A helper function to scroll to a specific page in the PagerView.
   * The transition between pages will *not* be animated.
   */
  setPageWithoutAnimation: (selectedPage: number) => void;
  /**
   * A helper function to enable/disable scroll imperatively
   * The recommended way is using the scrollEnabled prop, however, there might be a case where a
   * imperative solution is more useful (e.g. for not blocking an animation)
   */
  setScrollEnabled: (scrollEnabled: boolean) => void;
  /**
   * @deprecated The ref is the native view itself, use it directly.
   */
  pagerView: React.ComponentRef<typeof PagerViewNativeComponent>;
};

export type PagerViewRef = React.ComponentRef<typeof PagerViewNativeComponent> &
  PagerViewMethods;

export type PagerViewProps = Omit<NativeProps, 'layoutDirection'> & {
  /**
   * `'locale'` follows `I18nManager.isRTL`; native only receives `'ltr' | 'rtl'`.
   */
  layoutDirection?: 'ltr' | 'rtl' | 'locale';
  ref?: React.Ref<PagerViewRef>;
};

type NativeInstance = React.ComponentRef<typeof PagerViewNativeComponent>;

function bindCommand<Args extends unknown[]>(
  ref: React.RefObject<NativeInstance | null>,
  command: (view: NativeInstance, ...args: Args) => void
) {
  return (...args: Args) => {
    if (ref.current) {
      command(ref.current, ...args);
    }
  };
}

function deduceLayoutDirection(
  layoutDirection: PagerViewProps['layoutDirection']
) {
  if (!layoutDirection || layoutDirection === 'locale') {
    return I18nManager.isRTL ? 'rtl' : 'ltr';
  }
  return layoutDirection;
}

/**
 * Container that allows to flip left and right between child views. Each
 * child view of the `PagerView` will be treated as a separate page
 * and will be stretched to fill the `PagerView`.
 *
 * It is important all children are `<View>`s and not composite components.
 * You can set style properties like `padding` or `backgroundColor` for each
 * child. It is also important that each child have a `key` prop.
 *
 * ```tsx
 * <PagerView style={{ flex: 1 }} initialPage={0}>
 *   <View key="1">
 *     <Text>First page</Text>
 *   </View>
 *   <View key="2">
 *     <Text>Second page</Text>
 *   </View>
 * </PagerView>
 * ```
 */
export function PagerView({ ref, ...props }: PagerViewProps) {
  const nativeRef = useRef<NativeInstance>(null);
  const isScrolling = useRef(false);

  // Methods go on the native view, not a wrapper, which Animated needs.
  useImperativeHandle<PagerViewRef | null, PagerViewRef | null>(
    ref,
    () => {
      const instance = nativeRef.current;
      if (!instance) {
        return null;
      }
      const setPage = bindCommand(nativeRef, PagerViewNativeCommands.setPage);
      return Object.assign(instance, {
        setPage: (selectedPage: number, options?: SetPageOptions) =>
          setPage(selectedPage, options?.animation ?? 'scroll'),
        setPageWithoutAnimation: bindCommand(
          nativeRef,
          PagerViewNativeCommands.setPageWithoutAnimation
        ),
        setScrollEnabled: bindCommand(
          nativeRef,
          PagerViewNativeCommands.setScrollEnabledImperatively
        ),
        pagerView: instance,
      });
    },
    []
  );

  const onPageScrollStateChanged = (
    e: ReactNative.NativeSyntheticEvent<OnPageScrollStateChangedEventData>
  ) => {
    props.onPageScrollStateChanged?.(e);
    isScrolling.current = e.nativeEvent.pageScrollState === 'dragging';
    if (
      isScrolling.current &&
      Platform.OS === 'android' &&
      props.keyboardDismissMode === 'on-drag'
    ) {
      Keyboard.dismiss();
    }
  };

  const onMoveShouldSetResponderCapture = (
    e: ReactNative.GestureResponderEvent
  ) => isScrolling.current || !!props.onMoveShouldSetResponderCapture?.(e);

  const iosPageMargin = Platform.OS === 'ios' ? props.pageMargin ?? 0 : 0;

  return (
    <PagerViewNativeComponent
      {...props}
      ref={nativeRef}
      style={[
        props.style,
        iosPageMargin ? { marginHorizontal: -iosPageMargin / 2 } : null,
      ]}
      layoutDirection={deduceLayoutDirection(props.layoutDirection)}
      onPageScrollStateChanged={onPageScrollStateChanged}
      onMoveShouldSetResponderCapture={onMoveShouldSetResponderCapture}
      children={childrenWithOverriddenStyle(props.children, iosPageMargin)}
    />
  );
}

/** Keeps `useRef<PagerView>(null)` working. */
export type PagerView = PagerViewRef;
