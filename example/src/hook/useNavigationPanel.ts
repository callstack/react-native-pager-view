import type {
  PagerView,
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view';
import { createPage } from '../utils';
import { useCallback, useRef, useState } from 'react';

export type UseNavigationPanelProps = ReturnType<typeof useNavigationPanel>;

export interface EventLog {
  event: 'scroll' | 'select' | 'statusChanged';
  text: string;
  timestamp: Date;
}

const getBasePages = (pages: number) =>
  new Array(pages).fill('').map((_v, index) => createPage(index));

function useToggle(initialState: boolean): [boolean, () => void] {
  const [state, setState] = useState(initialState);
  const toggleState = useCallback(() => setState((enabled) => !enabled), [
    setState,
  ]);
  return [state, toggleState];
}

export function useNavigationPanel<T>(
  pagesAmount: number = 10,
  onPageSelectedCallback?: (position: number) => void
) {
  const ref = useRef<PagerView<T>>(null);

  const [activePage, setActivePage] = useState(0);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [pages, setPages] = useState(() => getBasePages(pagesAmount));
  const [progress, setProgress] = useState({ position: 0, offset: 0 });
  const [scrollState, setScrollState] = useState('idle');

  const [dotsEnabled, toggleDots] = useToggle(false);
  const [isAnimated, toggleAnimation] = useToggle(true);
  const [overdragEnabled, toggleOverdrag] = useToggle(false);
  const [scrollEnabled, toggleScroll] = useToggle(true);

  const addLog = useCallback(
    (log: EventLog) => {
      setLogs((text) => [log, ...text].slice(0, 100));
    },
    [setLogs]
  );

  const addPage = useCallback(
    () => setPages((prevPages) => [...prevPages, createPage(prevPages.length)]),
    [setPages]
  );

  const removePage = useCallback(
    () => setPages((prevPages) => prevPages.slice(0, prevPages.length - 1)),
    []
  );

  const onPageScroll = useCallback(
    ({ nativeEvent }: PagerViewOnPageScrollEvent) => {
      const { offset, position } = nativeEvent;
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
    [addLog, setProgress]
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
    [addLog, setScrollState]
  );

  const onPageSelected = useCallback(
    ({ nativeEvent }: PagerViewOnPageSelectedEvent) => {
      addLog({
        event: 'select',
        text: `Page: ${nativeEvent.position}`,
        timestamp: new Date(),
      });
      setActivePage(nativeEvent.position);
      if (onPageSelectedCallback != null) {
        onPageSelectedCallback(nativeEvent.position);
      }
    },
    [addLog, onPageSelectedCallback, setActivePage]
  );

  const setPage = useCallback(
    (page: number) => ref.current?.setPage(page, isAnimated),
    [isAnimated, ref]
  );

  return {
    ref,
    activePage,
    isAnimated,
    pages,
    scrollState,
    scrollEnabled,
    dotsEnabled,
    progress,
    overdragEnabled,
    setPage,
    addPage,
    removePage,
    toggleScroll,
    toggleDots,
    toggleAnimation,
    setProgress,
    onPageScroll,
    onPageSelected,
    onPageScrollStateChanged,
    toggleOverdrag,
    logs,
  };
}
