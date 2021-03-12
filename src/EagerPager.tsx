import React from 'react';
import { findNodeHandle, Keyboard, UIManager } from 'react-native';
import type {
  EagerPagerProps,
  PageScrollStateChangedNativeEvent,
  ViewPagerOnPageScrollEvent,
} from './types';
import { getReactStringKeys } from './utils';

import { ViewPagerNative } from './ViewPagerNative';

export class EagerPager extends React.PureComponent<EagerPagerProps> {
  private isScrolling = false;

  componentDidMount() {
    if (this.props.initialPage != null && this.props.initialPage > 0) {
      this.setPage(this.props.initialPage, false);
    }
  }

  /**
   * A helper function to scroll to a specific page in the ViewPager.
   * Default to animated transition between pages.
   */
  setPage(page: number, animated = true) {
    UIManager.dispatchViewManagerCommand(findNodeHandle(this), 'setPage', [
      page,
      animated,
    ]);
  }

  /**
   * A helper function to scroll to a specific page in the ViewPager.
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

  private onMoveShouldSetResponderCapture = () => this.isScrolling;

  private onPageScroll = (event: ViewPagerOnPageScrollEvent) => {
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

  render() {
    const keys = getReactStringKeys(this.props.children);

    return (
      <ViewPagerNative
        childrenKeys={keys}
        count={React.Children.count(this.props.children)}
        offscreenPageLimit={this.props.offscreenPageLimit}
        offset={0}
        onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
        onPageScroll={this.onPageScroll}
        onPageScrollStateChanged={this.onPageScrollStateChanged}
        onPageSelected={this.props.onPageSelected}
        orientation={this.props.orientation}
        overdrag={this.props.overdrag}
        pageMargin={this.props.pageMargin}
        scrollEnabled={this.props.scrollEnabled}
        showPageIndicator={this.props.showPageIndicator}
        style={this.props.style}
        transitionStyle={this.props.transitionStyle}
      >
        {this.props.children}
      </ViewPagerNative>
    );
  }
}
