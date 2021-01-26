import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewPagerProps, ViewPagerState } from './types';

import { ViewPagerNative } from './ViewPagerNative';

export class ViewPager<ItemT> extends React.Component<
  ViewPagerProps<ItemT>,
  ViewPagerState
> {
  constructor(props: ViewPagerProps<ItemT>) {
    super(props);
    this.state = { offset: 0 };
  }

  render() {
    const buffer = 1;
    const windowLength = 1 + 2 * buffer;
    const offset = this.state.offset;

    return (
      <ViewPagerNative
        count={this.props.data.length}
        offset={offset}
        onPageSelected={(event) => {
          this.setState({
            offset: Math.max(0, event.nativeEvent.position - buffer),
          });
        }}
        style={this.props.style}
      >
        {this.props.data
          .slice(offset, offset + windowLength)
          .map((item, index) => (
            <View
              key={this.props.keyExtractor(item, offset + index)}
              style={styles.pageContainer}
            >
              {this.props.renderItem({ item, index: offset + index })}
            </View>
          ))}
      </ViewPagerNative>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: { height: '100%', position: 'absolute', width: '100%' },
});
