import type {
  default as PagerView,
  PageScrollStateChangedNativeEvent,
  PagerViewOnPageScrollEventData,
  PagerViewOnPageSelectedEventData,
} from 'react-native-pager-view';
import { Animated } from 'react-native';
import { createPage, CreatePage } from '../utils';
import { useCallback, useMemo, useRef, useState } from 'react';

export type UseNavigationPanelProps = ReturnType<typeof useNavigationPanel>;

export interface EventLog {
  event: 'scroll' | 'select' | 'statusChanged';
  text: string;
  timestamp: Date;
}

const getBasePages = (pages: number) =>
  new Array(pages).fill('').map((_v, index) => createPage(index));

export function useNavigationPanel(
  pagesAmount: number = 10,
  onPageSelectedCallback?: (position: number) => void
) {
  const ref = useRef<PagerView>(null);
  const [pages, setPages] = useState<CreatePage[]>(() => getBasePages(pagesAmount));
  const [activePage, setActivePage] = useState(0);
  const [isAnimated, setIsAnimated] = useState(true);
  const [overdragEnabled, setOverdragEnabled] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [scrollState, setScrollState] = useState('idle');
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [progress, setProgress] = useState({ position: 0, offset: 0 });
  const [onPageScrollOffset] = useState(() => new Animated.Value(0));
  const [onPageScrollPosition] = useState(() => new Animated.Value(0));
  const [onPageSelectedPosition] = useState(() => new Animated.Value(0));

  const setPage = useCallback(
    (page: number) =>
      isAnimated
        ? ref.current?.setPage(page)
        : ref.current?.setPageWithoutAnimation(page),
    [isAnimated]
  );

  const addLog = useCallback((log: EventLog) => {
    setLogs((text) => [log, ...text].slice(0, 100));
  }, []);

  const addPage = useCallback(
    () => setPages((prevPages) => [...prevPages, createPage(prevPages.length)]),
    []
  );
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
            addLog({
              event: 'scroll',
              text: `Position: ${position} Offset: ${offset}`,
              timestamp: new Date(),
            });
            setProgress({
              position,
              offset,
            });
          },
          useNativeDriver: true,
        }
      ),
    [addLog, onPageScrollOffset, onPageScrollPosition]
  );

  const onPageSelected = useMemo(
    () =>
      Animated.event<PagerViewOnPageSelectedEventData>(
        [{ nativeEvent: { position: onPageSelectedPosition } }],
        {
          listener: ({ nativeEvent: { position } }) => {
            addLog({
              event: 'select',
              text: `Page: ${position}`,
              timestamp: new Date(),
            });
            setActivePage(position);
            onPageSelectedCallback?.(position);
          },
          useNativeDriver: true,
        }
      ),
    [addLog, onPageSelectedCallback, onPageSelectedPosition]
  );

  const onPageScrollStateChanged = useCallback(
    (e: PageScrollStateChangedNativeEvent) => {
      addLog({
        event: 'statusChanged',
        text: `State: ${e.nativeEvent.pageScrollState}`,
        timestamp: new Date(),
      });
      setScrollState(e.nativeEvent.pageScrollState);
    },
    [addLog]
  );

  return {
    ref,
    activePage,
    isAnimated,
    pages,
    scrollState,
    scrollEnabled,
    progress,
    overdrag: overdragEnabled,
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
    logs,
  };
}
