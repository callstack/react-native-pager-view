import React from 'react';
import { findNodeHandle, UIManager } from 'react-native';
import type {
  EagerPagerProps,
  PageScrollStateChangedNativeEvent,
} from './types';

import { ViewPagerNative } from './ViewPagerNative';

export class EagerPager extends React.PureComponent<EagerPagerProps> {
  private isScrolling = false;

  componentDidMount() {
    if (this.props.initialPage != null && this.props.initialPage > 0) {
      this.setPage(this.props.initialPage, false);
    }
  }

  setPage(page: number, animated = true) {
    UIManager.dispatchViewManagerCommand(findNodeHandle(this), 'setPage', [
      page,
      animated,
    ]);
  }

  setPageWithoutAnimation(page: number) {
    this.setPage(page, false);
  }

  private onMoveShouldSetResponderCapture = () => this.isScrolling;

  private onPageScrollStateChanged = (
    event: PageScrollStateChangedNativeEvent
  ) => {
    this.props.onPageScrollStateChanged?.(event);
    this.isScrolling = event.nativeEvent.pageScrollState === 'dragging';
  };

  render() {
    return (
      <ViewPagerNative
        count={React.Children.count(this.props.children)}
        offscreenPageLimit={this.props.offscreenPageLimit}
        offset={0}
        onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
        onPageScroll={this.props.onPageScroll}
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
