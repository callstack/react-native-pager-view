import { View } from 'react-native';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react-native';
import { usePagerView, type UsePagerViewProps } from '../index';

const mockDispatchCommand = jest.fn();
jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: (...args: unknown[]) => mockDispatchCommand(...args),
}));

async function renderPagerWithHook() {
  const hook: { current?: UsePagerViewProps } = {};
  const App = () => {
    const pager = usePagerView({ pagesAmount: 3 });
    hook.current = pager;
    const { AnimatedPagerView } = pager;
    return (
      <AnimatedPagerView
        testID="pager"
        ref={pager.ref}
        onPageScroll={pager.onPageScroll}
        onPageSelected={pager.onPageSelected}
        onPageScrollStateChanged={pager.onPageScrollStateChanged}
      >
        {pager.pages.map((page) => (
          <View key={page} />
        ))}
      </AnimatedPagerView>
    );
  };
  await render(<App />);
  return {
    hook: hook as Required<typeof hook>,
    pager: screen.getByTestId('pager'),
  };
}

afterEach(() => {
  mockDispatchCommand.mockClear();
});

it('creates the requested number of pages', async () => {
  const { result } = await renderHook(() => usePagerView({ pagesAmount: 3 }));

  expect(result.current.pages).toEqual([0, 1, 2]);
});

it('adds and removes pages, keeping at least one', async () => {
  const { result } = await renderHook(() => usePagerView({ pagesAmount: 1 }));

  await act(() => result.current.addPage());
  expect(result.current.pages).toEqual([0, 1]);

  await act(() => result.current.removePage());
  await act(() => result.current.removePage());
  expect(result.current.pages).toEqual([0]);
});

it('animates setPage until animation is toggled off', async () => {
  const { hook } = await renderPagerWithHook();

  await act(() => hook.current.setPage(1));
  expect(mockDispatchCommand).toHaveBeenLastCalledWith(
    expect.anything(),
    'setPage',
    [1, 'scroll']
  );

  await act(() => hook.current.toggleAnimation());
  await act(() => hook.current.setPage(2));
  expect(mockDispatchCommand).toHaveBeenLastCalledWith(
    expect.anything(),
    'setPageWithoutAnimation',
    [2]
  );
});

it('tracks the pager state from its events', async () => {
  const { hook, pager } = await renderPagerWithHook();

  await fireEvent(pager, 'pageScrollStateChanged', {
    nativeEvent: { pageScrollState: 'dragging' },
  });
  await fireEvent(pager, 'pageScroll', {
    nativeEvent: { position: 1, offset: 0.5 },
  });
  await fireEvent(pager, 'pageSelected', { nativeEvent: { position: 2 } });

  expect(hook.current).toMatchObject({
    scrollState: 'dragging',
    progress: { position: 1, offset: 0.5 },
    activePage: 2,
  });
});
