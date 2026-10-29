import React, { useImperativeHandle, useRef } from 'react';
import { I18nManager, Keyboard, Platform } from 'react-native';
import type * as ReactNative from 'react-native';

import { useLazyPages } from './useLazyPages';
import { childrenWithOverriddenStyle } from './utils';

import PagerViewNativeComponent, {
  Commands as PagerViewNativeCommands,
  type OnPageScrollEventData,
  type OnPageScrollStateChangedEventData,
  type OnPageSelectedEventData,
  type NativeProps,
} from './PagerViewNativeComponent';

export type PagerViewMethods = {
  /**
   * A helper function to scroll to a specific page in the PagerView.
   * The transition between pages will be animated.
   */
  setPage: (selectedPage: number) => void;
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

type LazyProps = {
  /** Mounts a page's content only when the pager gets near it. */
  lazy?: boolean;
  /** With `lazy`, how many pages on each side are mounted ahead of time. */
  lazyPreloadDistance?: number;
  /** With `lazy`, what a page shows before its content is mounted. */
  renderLazyPlaceholder?: (index: number) => React.ReactNode;
};

export type PagerViewProps = Omit<NativeProps, 'layoutDirection'> &
  LazyProps & {
    /**
     * `'locale'` follows `I18nManager.isRTL`; native only receives `'ltr' | 'rtl'`.
     */
    layoutDirection?: 'ltr' | 'rtl' | 'locale';
    ref?: React.Ref<PagerViewRef>;
  };

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
export function PagerView({
  ref,
  lazy = false,
  lazyPreloadDistance = 1,
  renderLazyPlaceholder,
  ...props
}: PagerViewProps) {
  const nativeRef =
    useRef<React.ComponentRef<typeof PagerViewNativeComponent>>(null);
  const isScrolling = useRef(false);
  const { children, setCurrent, onScroll, onSelect } = useLazyPages({
    lazy,
    preloadDistance: lazyPreloadDistance,
    initialPage: props.initialPage ?? 0,
    children: props.children,
    renderPlaceholder: renderLazyPlaceholder,
  });

  // Methods go on the native view, not a wrapper, which Animated needs.
  useImperativeHandle<PagerViewRef | null, PagerViewRef | null>(
    ref,
    () => {
      const instance = nativeRef.current;
      if (!instance) {
        return null;
      }
      return Object.assign(instance, {
        setPage: (selectedPage: number) => {
          setCurrent?.(selectedPage);
          if (nativeRef.current) {
            PagerViewNativeCommands.setPage(nativeRef.current, selectedPage);
          }
        },
        setPageWithoutAnimation: (selectedPage: number) => {
          setCurrent?.(selectedPage);
          if (nativeRef.current) {
            PagerViewNativeCommands.setPageWithoutAnimation(
              nativeRef.current,
              selectedPage
            );
          }
        },
        setScrollEnabled: (scrollEnabled: boolean) => {
          if (nativeRef.current) {
            PagerViewNativeCommands.setScrollEnabledImperatively(
              nativeRef.current,
              scrollEnabled
            );
          }
        },
        pagerView: instance,
      });
    },
    [setCurrent]
  );

  const onPageScroll = (
    e: ReactNative.NativeSyntheticEvent<OnPageScrollEventData>
  ) => {
    props.onPageScroll?.(e);

    onScroll(e.nativeEvent.position, e.nativeEvent.offset, isScrolling.current);

    // Not implemented on iOS yet
    if (Platform.OS === 'android' && props.keyboardDismissMode === 'on-drag') {
      Keyboard.dismiss();
    }
  };

  const onPageScrollStateChanged = (
    e: ReactNative.NativeSyntheticEvent<OnPageScrollStateChangedEventData>
  ) => {
    props.onPageScrollStateChanged?.(e);
    isScrolling.current = e.nativeEvent.pageScrollState === 'dragging';
  };

  const onPageSelected = (
    e: ReactNative.NativeSyntheticEvent<OnPageSelectedEventData>
  ) => {
    props.onPageSelected?.(e);
    onSelect(e.nativeEvent.position);
  };

  return (
    <PagerViewNativeComponent
      {...props}
      ref={nativeRef}
      style={[
        props.style,
        Platform.OS === 'ios' && props.pageMargin
          ? { marginHorizontal: -props.pageMargin / 2 }
          : null,
      ]}
      layoutDirection={deduceLayoutDirection(props.layoutDirection)}
      onPageScroll={onPageScroll}
      onPageScrollStateChanged={onPageScrollStateChanged}
      onPageSelected={onPageSelected}
      onMoveShouldSetResponderCapture={() => isScrolling.current}
      children={childrenWithOverriddenStyle(children, props.pageMargin)}
    />
  );
}

/** Keeps `useRef<PagerView>(null)` working. */
export type PagerView = PagerViewRef;
