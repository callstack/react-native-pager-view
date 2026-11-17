import React from 'react';
import {
  I18nManager,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import PagerView, { type PagerViewProps, type PagerViewRef } from '../index';

const mockDispatchCommand = jest.fn();
jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: (...args: unknown[]) => mockDispatchCommand(...args),
}));

const PAGES = ['A', 'B', 'C', 'D', 'E'];

function renderPager(props: Partial<PagerViewProps> = {}) {
  const ref = React.createRef<PagerViewRef>();
  const result = render(
    <PagerView testID="pager" ref={ref} {...props}>
      {PAGES.map((page) => (
        <View key={page}>
          <Text>{`Page ${page}`}</Text>
        </View>
      ))}
    </PagerView>
  );
  return result.then(() => ({ ref, pager: screen.getByTestId('pager') }));
}

const pageScroll = (position: number, offset: number) => ({
  nativeEvent: { position, offset },
});
const pageSelected = (position: number) => ({ nativeEvent: { position } });
const scrollState = (pageScrollState: 'idle' | 'dragging' | 'settling') => ({
  nativeEvent: { pageScrollState },
});

const expectMounted = (...pages: string[]) =>
  pages.forEach((page) =>
    expect(screen.getByText(`Page ${page}`)).toBeOnTheScreen()
  );
const expectNotMounted = (...pages: string[]) =>
  pages.forEach((page) =>
    expect(screen.queryByText(`Page ${page}`)).not.toBeOnTheScreen()
  );

afterEach(() => {
  mockDispatchCommand.mockClear();
  jest.restoreAllMocks();
});

describe('pages', () => {
  it('renders every child as a page', async () => {
    const { pager } = await renderPager();

    expect(pager.children).toHaveLength(PAGES.length);
    expectMounted(...PAGES);
  });

  it('skips empty children instead of rendering blank pages', async () => {
    const showSecond = false;
    await render(
      <PagerView testID="pager">
        <View key="a" />
        {showSecond && <View key="b" />}
        {null}
        <View key="c" />
      </PagerView>
    );

    expect(screen.getByTestId('pager').children).toHaveLength(2);
  });

  it('renders pages whose style is not an object', async () => {
    await render(
      <PagerView testID="pager">
        <View key="a" style={1 as never} />
      </PagerView>
    );

    expect(screen.getByTestId('pager').children).toHaveLength(1);
  });

  it.each([false, true])(
    'does not re-render memoized pages when the pager re-renders (lazy: %s)',
    async (lazy) => {
      const renders = jest.fn();
      const Page = React.memo(({ style }: { style?: ViewStyle }) => {
        renders();
        return <View style={style} />;
      });
      const styles = StyleSheet.create({ page: { backgroundColor: 'red' } });
      const App = ({ scrollEnabled }: { scrollEnabled: boolean }) => (
        <PagerView lazy={lazy} scrollEnabled={scrollEnabled}>
          <Page key="unstyled" />
          <Page key="styled" style={styles.page} />
        </PagerView>
      );

      const { rerender } = await render(<App scrollEnabled />);
      renders.mockClear();
      await rerender(<App scrollEnabled={false} />);

      expect(renders).not.toHaveBeenCalled();
    }
  );
});

describe('layoutDirection', () => {
  it.each([undefined, 'locale'] as const)(
    'follows the RTL locale when %s',
    async (layoutDirection) => {
      jest.replaceProperty(I18nManager, 'isRTL', true);

      const { pager } = await renderPager({ layoutDirection });

      expect(pager).toHaveProp('layoutDirection', 'rtl');
    }
  );

  it('lets an explicit direction override the locale', async () => {
    jest.replaceProperty(I18nManager, 'isRTL', true);

    const { pager } = await renderPager({ layoutDirection: 'ltr' });

    expect(pager).toHaveProp('layoutDirection', 'ltr');
  });
});

describe.each([false, true])('events (lazy: %s)', (lazy) => {
  it('forwards native events to the callbacks', async () => {
    const onPageScroll = jest.fn();
    const onPageSelected = jest.fn();
    const onPageScrollStateChanged = jest.fn();
    const { pager } = await renderPager({
      lazy,
      onPageScroll,
      onPageSelected,
      onPageScrollStateChanged,
    });

    await fireEvent(pager, 'pageScrollStateChanged', scrollState('dragging'));
    await fireEvent(pager, 'pageScroll', pageScroll(0, 0.5));
    await fireEvent(pager, 'pageSelected', pageSelected(1));

    expect(onPageScrollStateChanged).toHaveBeenCalledWith(
      scrollState('dragging')
    );
    expect(onPageScroll).toHaveBeenCalledWith(pageScroll(0, 0.5));
    expect(onPageSelected).toHaveBeenCalledWith(pageSelected(1));
  });
});

describe('ref methods', () => {
  it('scrolls through pages with setPage by default', async () => {
    const { ref } = await renderPager();

    await act(() => ref.current!.setPage(3));

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'setPage',
      [3, 'scroll']
    );
  });

  it('passes the requested setPage animation', async () => {
    const { ref } = await renderPager();

    await act(() => ref.current!.setPage(3, { animation: 'direct' }));

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'setPage',
      [3, 'direct']
    );
  });

  it('jumps without animation with setPageWithoutAnimation', async () => {
    const { ref } = await renderPager();

    await act(() => ref.current!.setPageWithoutAnimation(2));

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'setPageWithoutAnimation',
      [2]
    );
  });

  it('toggles scrolling with setScrollEnabled', async () => {
    const { ref } = await renderPager();

    ref.current!.setScrollEnabled(false);

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'setScrollEnabledImperatively',
      [false]
    );
  });
});

describe('keyboardDismissMode', () => {
  it('dismisses the keyboard once when a drag starts on Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    const { pager } = await renderPager({ keyboardDismissMode: 'on-drag' });

    await fireEvent(pager, 'pageScrollStateChanged', scrollState('dragging'));
    await fireEvent(pager, 'pageScroll', pageScroll(0, 0.2));
    await fireEvent(pager, 'pageScroll', pageScroll(0, 0.4));
    await fireEvent(pager, 'pageScrollStateChanged', scrollState('settling'));
    await fireEvent(pager, 'pageScrollStateChanged', scrollState('idle'));

    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['on Android without on-drag', 'android', 'none'],
    ['on iOS, which dismisses natively', 'ios', 'on-drag'],
  ] as const)('keeps the keyboard %s', async (_, os, keyboardDismissMode) => {
    jest.replaceProperty(Platform, 'OS', os);
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    const { pager } = await renderPager({ keyboardDismissMode });

    await fireEvent(pager, 'pageScrollStateChanged', scrollState('dragging'));

    expect(dismiss).not.toHaveBeenCalled();
  });
});

describe('lazy', () => {
  const renderLazyPlaceholder = (index: number) => (
    <Text>{`Placeholder ${index}`}</Text>
  );

  it('mounts only the initial page and its neighbours', async () => {
    await renderPager({ lazy: true, initialPage: 2, renderLazyPlaceholder });

    expectMounted('B', 'C', 'D');
    expectNotMounted('A', 'E');
    expect(screen.getByText('Placeholder 0')).toBeOnTheScreen();
    expect(screen.getByText('Placeholder 4')).toBeOnTheScreen();
  });

  it('preloads as many pages as lazyPreloadDistance', async () => {
    await renderPager({ lazy: true, initialPage: 2, lazyPreloadDistance: 0 });

    expectMounted('C');
    expectNotMounted('A', 'B', 'D', 'E');
  });

  it('mounts pages around the selected page and keeps visited ones', async () => {
    const { pager } = await renderPager({ lazy: true });

    await fireEvent(pager, 'pageSelected', pageSelected(3));

    expectMounted('A', 'B', 'C', 'D', 'E');
  });

  it('mounts a page as soon as it is dragged into view', async () => {
    const { pager } = await renderPager({
      lazy: true,
      lazyPreloadDistance: 0,
    });

    await fireEvent(pager, 'pageScrollStateChanged', scrollState('dragging'));
    await fireEvent(pager, 'pageScroll', pageScroll(0, 0.3));

    expectMounted('A', 'B');
    expectNotMounted('C');
  });

  it('mounts the setPage target without mounting the pages it passes', async () => {
    const { ref, pager } = await renderPager({
      lazy: true,
      lazyPreloadDistance: 0,
    });

    await act(() => ref.current!.setPage(3));
    await fireEvent(pager, 'pageScrollStateChanged', scrollState('settling'));
    await fireEvent(pager, 'pageScroll', pageScroll(1, 0.5));
    await fireEvent(pager, 'pageScroll', pageScroll(2, 0.5));
    await fireEvent(pager, 'pageSelected', pageSelected(3));

    expectMounted('A', 'D');
    expectNotMounted('B', 'C', 'E');
  });

  it('mounts the setPageWithoutAnimation target', async () => {
    const { ref } = await renderPager({
      lazy: true,
      lazyPreloadDistance: 0,
    });

    await act(() => ref.current!.setPageWithoutAnimation(4));

    expectMounted('E');
    expectNotMounted('B', 'C', 'D');
  });
});
