import React from 'react';
import { findNodeHandle, StyleSheet, UIManager, View } from 'react-native';
import type {
  PageScrollStateChangedNativeEvent,
  ViewPagerOnPageSelectedEvent,
  ViewPagerProps,
  ViewPagerState,
} from './types';

import { ViewPagerNative } from './ViewPagerNative';

type RenderWindowData = {
  buffer: number | undefined;
  currentPage: number;
  maxRenderWindow: number | undefined;
  offset: number;
  windowLength: number;
};

export class ViewPager<ItemT> extends React.PureComponent<
  ViewPagerProps<ItemT>,
  ViewPagerState
> {
  private isScrolling = false;

  constructor(props: ViewPagerProps<ItemT>) {
    super(props);
    this.state = this.computeRenderWindow({
      buffer: props.buffer,
      currentPage: props.initialPage ?? 0,
      maxRenderWindow: props.maxRenderWindow,
      offset: 0,
      windowLength: 0,
    });
  }

  componentDidMount() {
    if (this.props.initialPage != null && this.props.initialPage > 0) {
      // Send command directly; render window already contains destination.
      UIManager.dispatchViewManagerCommand(findNodeHandle(this), 'setPage', [
        this.props.initialPage,
        false,
      ]);
    }
  }

  setPage(page: number, animated = true) {
    if (page < 0 || page >= this.props.data.length) {
      return;
    }

    // Start rendering the destination.
    this.setState((prevState) =>
      this.computeRenderWindow({
        buffer: this.props.buffer,
        currentPage: page,
        maxRenderWindow: this.props.maxRenderWindow,
        offset: prevState.offset,
        windowLength: prevState.windowLength,
      })
    );
    // Send paging command.
    requestAnimationFrame(() => {
      UIManager.dispatchViewManagerCommand(findNodeHandle(this), 'setPage', [
        page,
        animated,
      ]);
    });
  }

  setPageWithoutAnimation(page: number) {
    this.setPage(page, false);
  }

  /**
   * Compute desired render window size.
   *
   * Returns `offset` and `windowLength` unmodified, unless in conflict with
   * restrictions from `buffer` or `maxRenderWindow`.
   */
  private computeRenderWindow(data: RenderWindowData): ViewPagerState {
    const buffer = Math.max(data.buffer ?? 1, 1);
    let offset = Math.max(Math.min(data.offset, data.currentPage - buffer), 0);
    let windowLength =
      Math.max(data.offset + data.windowLength, data.currentPage + buffer + 1) -
      offset;

    let maxRenderWindow = data.maxRenderWindow ?? 0;
    if (maxRenderWindow !== 0) {
      maxRenderWindow = Math.max(maxRenderWindow, 1 + 2 * buffer);
      if (windowLength > maxRenderWindow) {
        offset = data.currentPage - Math.floor(maxRenderWindow / 2);
        windowLength = maxRenderWindow;
      }
    }

    return { offset, windowLength };
  }

  private onMoveShouldSetResponderCapture = () => this.isScrolling;

  private onPageScrollStateChanged = (
    event: PageScrollStateChangedNativeEvent
  ) => {
    this.props.onPageScrollStateChanged?.(event);
    this.isScrolling = event.nativeEvent.pageScrollState === 'dragging';
  };

  private onPageSelected = (event: ViewPagerOnPageSelectedEvent) => {
    const currentPage = event.nativeEvent.position;
    this.setState((prevState) =>
      this.computeRenderWindow({
        buffer: this.props.buffer,
        currentPage,
        maxRenderWindow: this.props.maxRenderWindow,
        offset: prevState.offset,
        windowLength: prevState.windowLength,
      })
    );
    this.props.onPageSelected?.(event);
  };

  private renderChildren(offset: number, windowLength: number) {
    return this.props.data
      .slice(offset, offset + windowLength)
      .map((item, index) => (
        <View
          collapsable={false}
          key={this.props.keyExtractor(item, offset + index)}
          style={styles.pageContainer}
        >
          {this.props.renderItem({ item, index: offset + index })}
        </View>
      ));
  }

  render() {
    const { offset, windowLength } = this.state;

    return (
      <ViewPagerNative
        count={this.props.data.length}
        offscreenPageLimit={this.props.offscreenPageLimit}
        offset={offset}
        onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
        onPageScroll={this.props.onPageScroll}
        onPageScrollStateChanged={this.onPageScrollStateChanged}
        onPageSelected={this.onPageSelected}
        orientation={this.props.orientation}
        overdrag={this.props.overdrag}
        pageMargin={this.props.pageMargin}
        scrollEnabled={this.props.scrollEnabled}
        showPageIndicator={this.props.showPageIndicator}
        style={this.props.style}
        transitionStyle={this.props.transitionStyle}
      >
        {this.renderChildren(offset, windowLength)}
      </ViewPagerNative>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: { height: '100%', position: 'absolute', width: '100%' },
});
