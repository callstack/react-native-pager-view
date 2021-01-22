import React, { useState } from 'react';
import {
  NativeSyntheticEvent,
  requireNativeComponent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type ViewPagerNativeProps = {
  count: number;
  offset: number;
  onPageSelected: (event: NativeSyntheticEvent<{ page: number }>) => void;
  style: StyleProp<ViewStyle>;
};

const ViewPagerNative = requireNativeComponent<ViewPagerNativeProps>(
  'RNCViewPager'
);

type ViewPagerProps<ItemT> = {
  /**
   * Array of data to be rendered as pages.
   */
  data: ItemT[];

  /**
   * Compute a unique key for the given item at the specified index.
   */
  keyExtractor: (item: ItemT, index: number) => string;

  /**
   * Render an item from `data` into a page.
   */
  renderItem: (info: { item: ItemT; index: number }) => React.ReactElement;

  style?: StyleProp<ViewStyle>;
};

/**
 * Display a view of swipable pages.
 */
export function ViewPager<ItemT>(props: ViewPagerProps<ItemT>) {
  const [offset, setOffset] = useState(0);
  const buffer = 1;
  const windowLength = 1 + 2 * buffer;

  return (
    <ViewPagerNative
      count={props.data.length}
      offset={offset}
      onPageSelected={(event) => {
        setOffset(Math.max(0, event.nativeEvent.page - buffer));
      }}
      style={props.style}
    >
      {props.data.slice(offset, offset + windowLength).map((item, index) => (
        <View
          key={props.keyExtractor(item, offset + index)}
          style={styles.pageContainer}
        >
          {props.renderItem({ item, index: offset + index })}
        </View>
      ))}
    </ViewPagerNative>
  );
}

const styles = StyleSheet.create({
  pageContainer: { height: '100%', position: 'absolute', width: '100%' },
});
