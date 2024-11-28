import type * as ReactNative from 'react-native';
import type {
  OnPageScrollEventData as PagerViewOnPageScrollEventData,
  OnPageSelectedEventData as PagerViewOnPageSelectedEventData,
  OnPageScrollStateChangedEventData as PageScrollStateChangedNativeEventData,
} from './PagerViewNativeComponent';

type PageScrollStateChangedNativeEvent =
  ReactNative.NativeSyntheticEvent<PageScrollStateChangedNativeEventData>;

import { PagerView } from './PagerView';

import { Animated } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';

export type UsePagerViewProps = ReturnType<typeof usePagerView>;

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

type UsePagerViewParams = {
  pagesAmount: number;
};

export function usePagerView(
  { pagesAmount }: UsePagerViewParams = { pagesAmount: 0 }
) {
  const ref = useRef<PagerView>(null);
  const [pages, setPages] = useState<number[]>(
    new Array(pagesAmount).fill('').map((_v, index) => index)
  );
  const [activePage, setActivePage] = useState(0);
  const [isAnimated, setIsAnimated] = useState(true);
  const [overdragEnabled, setOverdragEnabled] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [scrollState, setScrollState] = useState('idle');
  const [progress, setProgress] = useState({ position: 0, offset: 0 });
  const onPageScrollOffset = useRef(new Animated.Value(0)).current;
  const onPageScrollPosition = useRef(new Animated.Value(0)).current;
  const onPageSelectedPosition = useRef(new Animated.Value(0)).current;

  const setPage = useCallback(
    (page: number) =>
      isAnimated
        ? ref.current?.setPage(page)
        : ref.current?.setPageWithoutAnimation(page),
    [isAnimated]
  );

  const addPage = useCallback(() => {
    setPages((prevPages) => {
      return [...prevPages, prevPages.length];
    });
  }, []);

  const removePage = useCallback(() => {
    setPages((prevPages) => {
      if (prevPages.length === 1) {
        return prevPages;
      }
      return prevPages.slice(0, prevPages.length - 1);
    });
  }, []);

  const toggleAnimation = useCallback(
    () => setIsAnimated((animated) => !animated),
    []
  );

  const toggleScroll = useCallback(
    () => setScrollEnabled((enabled) => !enabled),
    []
  );

  const toggleOverdrag = useCallback(
    () => setOverdragEnabled((enabled) => !enabled),
    []
  );

  const onPageScroll = useMemo(
    () =>
      Animated.event<PagerViewOnPageScrollEventData>(
        [
          {
            nativeEvent: {
              offset: onPageScrollOffset,
              position: onPageScrollPosition,
            },
          },
        ],
        {
          listener: ({ nativeEvent: { offset, position } }) => {
            setProgress({
              position,
              offset,
            });
          },
          useNativeDriver: true,
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onPageSelected = useMemo(
    () =>
      Animated.event<PagerViewOnPageSelectedEventData>(
        [{ nativeEvent: { position: onPageSelectedPosition } }],
        {
          listener: ({ nativeEvent: { position } }) => {
            setActivePage(position);
          },
          useNativeDriver: true,
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onPageScrollStateChanged = useCallback(
    (e: PageScrollStateChangedNativeEvent) => {
      setScrollState(e.nativeEvent.pageScrollState);
    },
    []
  );

  return {
    ref,
    activePage,
    isAnimated,
    pages,
    scrollState,
    scrollEnabled,
    progress,
    overdragEnabled,
    setPage,
    addPage,
    removePage,
    toggleScroll,
    toggleAnimation,
    setProgress,
    onPageScroll,
    onPageSelected,
    onPageScrollStateChanged,
    toggleOverdrag,
    AnimatedPagerView,
    PagerView,
  };
}
