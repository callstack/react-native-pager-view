import React from 'react';
import { findNodeHandle, UIManager } from 'react-native';
import type { EagerPagerProps } from './types';

import { ViewPagerNative } from './ViewPagerNative';

export class EagerPager extends React.PureComponent<EagerPagerProps> {
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

  render() {
    return (
      <ViewPagerNative
        count={React.Children.count(this.props.children)}
        offscreenPageLimit={this.props.offscreenPageLimit}
        offset={0}
        onPageScroll={this.props.onPageScroll}
        onPageScrollStateChanged={this.props.onPageScrollStateChanged}
        onPageSelected={this.props.onPageSelected}
        orientation={this.props.orientation}
        overdrag={this.props.overdrag}
        scrollEnabled={this.props.scrollEnabled}
        style={this.props.style}
        transitionStyle={this.props.transitionStyle}
      >
        {this.props.children}
      </ViewPagerNative>
    );
  }
}
