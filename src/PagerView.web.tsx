import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';

import { childrenWithOverriddenStyle } from './utils';

import type {
  NativeProps,
  OnPageScrollEventData,
  OnPageSelectedEventData,
  OnPageScrollStateChangedEventData,
} from './PagerViewNativeComponent';

type ScrollState = 'idle' | 'dragging' | 'settling';

type PagerViewImperativeHandle = {
  setPage: (index: number) => void;
  setPageWithoutAnimation: (index: number) => void;
  setScrollEnabled: (enabled: boolean) => void;
};

const PagerViewWeb = React.forwardRef<PagerViewImperativeHandle, NativeProps>(
  function PagerViewWeb(props, ref) {
    const {
      children,
      initialPage = 0,
      scrollEnabled: scrollEnabledProp = true,
      orientation = 'horizontal',
      pageMargin = 0,
      layoutDirection = 'ltr',
      keyboardDismissMode = 'none',
      onPageScroll,
      onPageSelected,
      onPageScrollStateChanged,
      offscreenPageLimit = 0,
      overScrollMode = 'auto',
      overdrag = false,
      style,
      ...viewProps
    } = props;

    const scrollViewRef = useRef<ScrollView>(null);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);
    const [scrollEnabledState, setScrollEnabledState] = useState<boolean>(
      scrollEnabledProp ?? true
    );
    const scrollStateRef = useRef<ScrollState>('idle');
    const currentPageRef = useRef(initialPage);
    const initialPageSetRef = useRef(false);

    const isHorizontal = orientation !== 'vertical';

    // Sync prop changes
    useEffect(() => {
      setScrollEnabledState(scrollEnabledProp ?? true);
    }, [scrollEnabledProp]);

    const getPageSize = useCallback(() => {
      return isHorizontal ? pageWidth : pageHeight;
    }, [isHorizontal, pageWidth, pageHeight]);

    // Use refs for event callbacks so DOM effects don't re-run on every render
    const onPageScrollRef = useRef(onPageScroll);
    const onPageSelectedRef = useRef(onPageSelected);
    const onPageScrollStateChangedRef = useRef(onPageScrollStateChanged);
    onPageScrollRef.current = onPageScroll;
    onPageSelectedRef.current = onPageSelected;
    onPageScrollStateChangedRef.current = onPageScrollStateChanged;

    const emitPageScrollStateChanged = useCallback((state: ScrollState) => {
      if (scrollStateRef.current === state) {
        return;
      }
      scrollStateRef.current = state;
      onPageScrollStateChangedRef.current?.({
        nativeEvent: { pageScrollState: state },
      } as NativeSyntheticEvent<OnPageScrollStateChangedEventData>);
    }, []);

    const emitPageSelected = useCallback((position: number) => {
      if (currentPageRef.current === position) {
        return;
      }
      currentPageRef.current = position;
      onPageSelectedRef.current?.({
        nativeEvent: { position },
      } as NativeSyntheticEvent<OnPageSelectedEventData>);
    }, []);

    const emitPageScroll = useCallback((position: number, offset: number) => {
      onPageScrollRef.current?.({
        nativeEvent: { position, offset },
      } as NativeSyntheticEvent<OnPageScrollEventData>);
    }, []);

    // --- Imperative API ---

    useImperativeHandle(ref, () => ({
      setPage: (index: number) => {
        const size = getPageSize();
        if (!size || !scrollViewRef.current) {
          return;
        }
        emitPageScrollStateChanged('settling');
        scrollViewRef.current.scrollTo(
          isHorizontal
            ? { x: index * size, animated: true }
            : { y: index * size, animated: true }
        );
      },
      setPageWithoutAnimation: (index: number) => {
        const size = getPageSize();
        if (!size || !scrollViewRef.current) {
          return;
        }
        scrollViewRef.current.scrollTo(
          isHorizontal
            ? { x: index * size, animated: false }
            : { y: index * size, animated: false }
        );
        emitPageSelected(index);
        emitPageScrollStateChanged('idle');
      },
      setScrollEnabled: (enabled: boolean) => {
        setScrollEnabledState(enabled);
      },
    }));

    const onLayout = useCallback(
      (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
        const { width, height } = e.nativeEvent.layout;
        setPageWidth(width);
        setPageHeight(height);
      },
      []
    );

    // Set initial page once we have dimensions
    useEffect(() => {
      const size = getPageSize();
      if (size > 0 && !initialPageSetRef.current) {
        initialPageSetRef.current = true;
        if (initialPage > 0) {
          scrollViewRef.current?.scrollTo(
            isHorizontal
              ? { x: initialPage * size, animated: false }
              : { y: initialPage * size, animated: false }
          );
        }
        currentPageRef.current = initialPage;
      }
    }, [getPageSize, initialPage, isHorizontal]);

    const handleScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const size = getPageSize();
        if (!size) {
          return;
        }

        const contentOffset = isHorizontal
          ? Math.abs(e.nativeEvent.contentOffset.x)
          : e.nativeEvent.contentOffset.y;

        const rawPosition = contentOffset / size;
        const position = Math.floor(rawPosition);
        const offset = rawPosition - position;

        emitPageScroll(position, offset);
      },
      [getPageSize, isHorizontal, emitPageScroll]
    );

    const dragRef = useRef<{
      startX: number;
      startY: number;
      startScroll: number;
      startPage: number;
      isDragging: boolean;
    } | null>(null);

    useEffect(() => {
      const scrollView = scrollViewRef.current;
      if (!scrollView) {
        return;
      }

      const node = (scrollView as any).getScrollableNode?.() as any;
      if (!node) {
        return;
      }

      const onMouseDown = (e: any) => {
        if (!scrollEnabledState) {
          return;
        }
        const size = getPageSize();
        if (!size) {
          return;
        }

        const scrollPos = isHorizontal ? node.scrollLeft : node.scrollTop;
        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startScroll: scrollPos,
          startPage: Math.round(Math.abs(scrollPos) / size),
          isDragging: false,
        };
      };

      const onMouseMove = (e: any) => {
        const drag = dragRef.current;
        if (!drag) {
          return;
        }

        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        const delta = isHorizontal ? dx : dy;

        // Dead zone — 8px before recognizing as a drag
        if (!drag.isDragging) {
          const primaryDelta = isHorizontal ? Math.abs(dx) : Math.abs(dy);
          const secondaryDelta = isHorizontal ? Math.abs(dy) : Math.abs(dx);
          if (primaryDelta < 8) {
            return;
          }
          // If moving more in the secondary axis, not a pager swipe
          if (secondaryDelta > primaryDelta) {
            dragRef.current = null;
            return;
          }
          drag.isDragging = true;
          // Disable scroll-snap during drag so programmatic scrollLeft works
          node.style.scrollSnapType = 'none';
          emitPageScrollStateChanged('dragging');
          e.preventDefault();
        }

        if (drag.isDragging) {
          e.preventDefault();
          const size = getPageSize();
          if (!size) {
            return;
          }

          // Clamp scroll to at most one page from start
          const maxScroll = (drag.startPage + 1) * size;
          const minScroll = (drag.startPage - 1) * size;
          const targetScroll = drag.startScroll - delta;
          const clamped = Math.max(
            minScroll,
            Math.min(maxScroll, targetScroll)
          );

          if (isHorizontal) {
            node.scrollLeft = clamped;
          } else {
            node.scrollTop = clamped;
          }
        }
      };

      const onMouseUp = (e: any) => {
        const drag = dragRef.current;
        if (!drag || !drag.isDragging) {
          dragRef.current = null;
          return;
        }
        dragRef.current = null;

        const size = getPageSize();
        if (!size) {
          return;
        }

        const delta = isHorizontal
          ? e.clientX - drag.startX
          : e.clientY - drag.startY;

        // Determine target page: if dragged > 25% of page size, go to next/prev
        const threshold = size * 0.25;
        let targetPage = drag.startPage;
        if (delta < -threshold) {
          targetPage = Math.min(
            drag.startPage + 1,
            React.Children.count(children) - 1
          );
        } else if (delta > threshold) {
          targetPage = Math.max(drag.startPage - 1, 0);
        }

        // Keep snap disabled — animate to target, then re-enable in scroll idle handler
        emitPageScrollStateChanged('settling');
        scrollViewRef.current?.scrollTo(
          isHorizontal
            ? { x: targetPage * size, animated: true }
            : { y: targetPage * size, animated: true }
        );
      };

      // @ts-expect-error window is a web-only global
      const win = typeof window !== 'undefined' ? window : undefined;
      node.addEventListener('mousedown', onMouseDown);
      win?.addEventListener('mousemove', onMouseMove);
      win?.addEventListener('mouseup', onMouseUp);

      return () => {
        node.removeEventListener('mousedown', onMouseDown);
        win?.removeEventListener('mousemove', onMouseMove);
        win?.removeEventListener('mouseup', onMouseUp);
      };
    }, [
      getPageSize,
      isHorizontal,
      scrollEnabledState,
      emitPageScrollStateChanged,
      children,
    ]);

    // Detect scroll settled: when no scroll events fire for 150ms, scroll is done.
    // More reliable than scrollend which doesn't fire consistently across browsers.
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      const scrollView = scrollViewRef.current;
      if (!scrollView) {
        return;
      }

      const node = (scrollView as any).getScrollableNode?.() as any;
      if (!node) {
        return;
      }

      const onNativeScroll = () => {
        // Mark as dragging if idle (touch/trackpad initiated scroll)
        if (!dragRef.current?.isDragging && scrollStateRef.current === 'idle') {
          emitPageScrollStateChanged('dragging');
        }

        // Reset the settle timer on every scroll event
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        scrollTimerRef.current = setTimeout(() => {
          const size = getPageSize();
          if (!size) {
            return;
          }

          const scrollPos = isHorizontal
            ? Math.abs(node.scrollLeft)
            : node.scrollTop;
          const page = Math.round(scrollPos / size);

          // Re-enable scroll-snap after mouse drag completes
          node.style.scrollSnapType = isHorizontal
            ? 'x mandatory'
            : 'y mandatory';

          if (scrollStateRef.current === 'dragging') {
            emitPageScrollStateChanged('settling');
          }
          emitPageSelected(page);
          emitPageScrollStateChanged('idle');
        }, 150);
      };

      node.addEventListener('scroll', onNativeScroll);
      return () => {
        node.removeEventListener('scroll', onNativeScroll);
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
      };
    }, [
      getPageSize,
      isHorizontal,
      emitPageSelected,
      emitPageScrollStateChanged,
    ]);

    const hasLayout = pageWidth > 0 && pageHeight > 0;
    const wrappedChildren = hasLayout
      ? childrenWithOverriddenStyle(
          children,
          pageMargin,
          pageWidth,
          pageHeight,
          offscreenPageLimit > 0 ? offscreenPageLimit : undefined,
          currentPageRef.current
        )
      : null;

    return (
      <View
        {...viewProps}
        style={[styles.container, style]}
        onLayout={onLayout}
      >
        {hasLayout && (
          <ScrollView
            ref={scrollViewRef}
            horizontal={isHorizontal}
            pagingEnabled
            scrollEnabled={scrollEnabledState}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            keyboardDismissMode={
              keyboardDismissMode === 'none' ? 'none' : 'on-drag'
            }
            onScroll={handleScroll}
            style={[
              styles.scrollView,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                direction: layoutDirection === 'rtl' ? 'rtl' : 'ltr',
                // @ts-expect-error overscrollBehavior is a web-only CSS property
                overscrollBehavior:
                  overdrag || overScrollMode === 'always' ? 'auto' : 'none',
              },
            ]}
            contentContainerStyle={
              isHorizontal ? styles.contentHorizontal : styles.contentVertical
            }
          >
            {wrappedChildren}
          </ScrollView>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  contentHorizontal: {
    flexDirection: 'row',
  },
  contentVertical: {
    flexDirection: 'column',
  },
});

// Export as a class-like shape so existing code that does
// `ref.current?.setPage()` works unchanged.
// The name `PagerView` matches the native export.
export { PagerViewWeb as PagerView };
