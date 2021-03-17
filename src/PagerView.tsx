import React from 'react';
import {
  findNodeHandle,
  Keyboard,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import type {
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
  PagerViewProps,
  PagerViewState,
  PageScrollStateChangedNativeEvent,
} from './types';

import { PagerViewNative } from './PagerViewNative';

type RenderWindowData = {
  buffer: number | undefined;
  currentPage: number;
  maxRenderWindow: number | undefined;
  offset: number;
  windowLength: number;
};

export class PagerView<ItemT> extends React.PureComponent<
  PagerViewProps<ItemT>,
  PagerViewState
> {
  private isScrolling = false;

  constructor(props: PagerViewProps<ItemT>) {
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
    if (this.props.initialPage) {
      // Send command directly; render window already contains destination.
      UIManager.dispatchViewManagerCommand(findNodeHandle(this), 'setPage', [
        this.props.initialPage,
        false,
      ]);
    }
  }

  /**
   * A helper function to scroll to a specific page in the PagerView.
   * Default to animated transition between pages.
   */
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

  /**
   * A helper function to scroll to a specific page in the PagerView.
   * The transition between pages will *not* be animated.
   */
  setPageWithoutAnimation(page: number) {
    this.setPage(page, false);
  }

  /**
   * A helper function to enable/disable scroll imperatively.
   * The recommended way is using the scrollEnabled prop, however, there might
   * be a case where an imperative solution is more useful (e.g. for not
   * blocking an animation)
   */
  setScrollEnabled(scrollEnabled: boolean) {
    UIManager.dispatchViewManagerCommand(
      findNodeHandle(this),
      'setScrollEnabled',
      [scrollEnabled]
    );
  }

  /**
   * Compute desired render window size.
   *
   * Returns `offset` and `windowLength` unmodified, unless in conflict with
   * restrictions from `buffer` or `maxRenderWindow`.
   */
  private computeRenderWindow(data: RenderWindowData): PagerViewState {
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

  private onPageScroll = (event: PagerViewOnPageScrollEvent) => {
    this.props.onPageScroll?.(event);
    if (this.props.keyboardDismissMode === 'on-drag') {
      Keyboard.dismiss();
    }
  };

  private onPageScrollStateChanged = (
    event: PageScrollStateChangedNativeEvent
  ) => {
    this.props.onPageScrollStateChanged?.(event);
    this.isScrolling = event.nativeEvent.pageScrollState === 'dragging';
  };

  private onPageSelected = (event: PagerViewOnPageSelectedEvent) => {
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
    const keys: string[] = [];
    return {
      children: this.props.data
        .slice(offset, offset + windowLength)
        .map((item, index) => {
          const key = this.props.keyExtractor(item, offset + index);
          keys.push(key);
          return (
            <View collapsable={false} key={key} style={styles.pageContainer}>
              {this.props.renderItem({ item, index: offset + index })}
            </View>
          );
        }),
      keys,
    };
  }

  render() {
    const { offset, windowLength } = this.state;
    const { children, keys } = this.renderChildren(offset, windowLength);

    return (
      <PagerViewNative
        childrenKeys={keys}
        count={this.props.data.length}
        offscreenPageLimit={this.props.offscreenPageLimit}
        offset={offset}
        onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
        onPageScroll={this.onPageScroll}
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
        {children}
      </PagerViewNative>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: { height: '100%', position: 'absolute', width: '100%' },
});
