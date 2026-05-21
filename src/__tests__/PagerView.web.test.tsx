import React, { createRef } from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';

import { PagerView } from '../PagerView.web';

const PAGER_TEST_ID = 'pager-container';

const renderPager = (props: Record<string, any> = {}) => {
  const ref = createRef<any>();
  const result = render(
    <PagerView
      ref={ref}
      testID={PAGER_TEST_ID}
      style={{ width: 300, height: 500 }}
      {...props}
    >
      <View key="1">
        <Text>Page 1</Text>
      </View>
      <View key="2">
        <Text>Page 2</Text>
      </View>
      <View key="3">
        <Text>Page 3</Text>
      </View>
    </PagerView>
  );
  return { ...result, ref };
};

const simulateLayout = (
  result: ReturnType<typeof renderPager>,
  width = 300,
  height = 500
) => {
  act(() => {
    fireEvent(result.getByTestId(PAGER_TEST_ID), 'layout', {
      nativeEvent: { layout: { width, height, x: 0, y: 0 } },
    });
  });
};

describe('PagerView.web', () => {
  describe('rendering', () => {
    it('does not render children before layout', () => {
      const { queryByText } = renderPager();
      expect(queryByText('Page 1')).toBeNull();
    });

    it('renders all children after layout', () => {
      const result = renderPager();
      simulateLayout(result);
      expect(result.getByText('Page 1')).toBeTruthy();
      expect(result.getByText('Page 2')).toBeTruthy();
      expect(result.getByText('Page 3')).toBeTruthy();
    });

    it('renders outer container immediately', () => {
      const { getByTestId } = renderPager();
      expect(getByTestId(PAGER_TEST_ID)).toBeTruthy();
    });
  });

  describe('imperative API', () => {
    it('exposes setPage method', () => {
      const { ref } = renderPager();
      expect(ref.current?.setPage).toBeInstanceOf(Function);
    });

    it('exposes setPageWithoutAnimation method', () => {
      const { ref } = renderPager();
      expect(ref.current?.setPageWithoutAnimation).toBeInstanceOf(Function);
    });

    it('exposes setScrollEnabled method', () => {
      const { ref } = renderPager();
      expect(ref.current?.setScrollEnabled).toBeInstanceOf(Function);
    });

    it('setPage does not throw without layout', () => {
      const { ref } = renderPager();
      expect(() => {
        act(() => ref.current?.setPage(1));
      }).not.toThrow();
    });

    it('setPageWithoutAnimation does not throw without layout', () => {
      const { ref } = renderPager();
      expect(() => {
        act(() => ref.current?.setPageWithoutAnimation(2));
      }).not.toThrow();
    });
  });

  describe('props', () => {
    it('renders with scrollEnabled=false', () => {
      const result = renderPager({ scrollEnabled: false });
      simulateLayout(result);
      expect(result.getByText('Page 1')).toBeTruthy();
    });

    it('renders with orientation=vertical', () => {
      const result = renderPager({ orientation: 'vertical' });
      simulateLayout(result);
      expect(result.getByText('Page 1')).toBeTruthy();
    });

    it('renders with layoutDirection=rtl', () => {
      const result = renderPager({ layoutDirection: 'rtl' });
      simulateLayout(result);
      expect(result.getByText('Page 1')).toBeTruthy();
    });

    it('renders with pageMargin', () => {
      const result = renderPager({ pageMargin: 20 });
      simulateLayout(result);
      expect(result.getByText('Page 1')).toBeTruthy();
    });

    it('renders with initialPage', () => {
      const result = renderPager({ initialPage: 2 });
      simulateLayout(result);
      expect(result.getByText('Page 3')).toBeTruthy();
    });
  });

  describe('events', () => {
    it('accepts event callbacks without error', () => {
      const result = renderPager({
        onPageScroll: jest.fn(),
        onPageSelected: jest.fn(),
        onPageScrollStateChanged: jest.fn(),
      });
      simulateLayout(result);
      expect(result.getByText('Page 1')).toBeTruthy();
    });

    it('setPageWithoutAnimation emits onPageSelected', () => {
      const onPageSelected = jest.fn();
      const result = renderPager({ onPageSelected });
      simulateLayout(result);

      act(() => result.ref.current?.setPageWithoutAnimation(2));

      expect(onPageSelected).toHaveBeenCalledWith(
        expect.objectContaining({
          nativeEvent: expect.objectContaining({ position: 2 }),
        })
      );
    });

    it('setPageWithoutAnimation does not emit redundant idle', () => {
      const onPageScrollStateChanged = jest.fn();
      const result = renderPager({ onPageScrollStateChanged });
      simulateLayout(result);

      // State starts as idle, setPageWithoutAnimation stays idle
      // Dedup guard means no emission when state doesn't change
      act(() => result.ref.current?.setPageWithoutAnimation(1));

      const states = onPageScrollStateChanged.mock.calls.map(
        (c: any) => c[0].nativeEvent.pageScrollState
      );
      expect(states).not.toContain('idle');
    });

    it('setPage emits settling state', () => {
      const onPageScrollStateChanged = jest.fn();
      const result = renderPager({ onPageScrollStateChanged });
      simulateLayout(result);

      act(() => result.ref.current?.setPage(2));

      const states = onPageScrollStateChanged.mock.calls.map(
        (c: any) => c[0].nativeEvent.pageScrollState
      );
      expect(states).toContain('settling');
    });

    it('setPageWithoutAnimation does not emit for same page', () => {
      const onPageSelected = jest.fn();
      const result = renderPager({ onPageSelected });
      simulateLayout(result);

      // Page starts at 0, setting to 0 should not emit
      act(() => result.ref.current?.setPageWithoutAnimation(0));

      expect(onPageSelected).not.toHaveBeenCalled();
    });
  });
});
