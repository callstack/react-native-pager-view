/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type {
  PageScrollEvent,
  PageScrollStateChangedEvent,
  PageSelectedEvent,
  ViewPagerProps,
} from './types';

const React = require('react');
const ReactNative = require('react-native');

const {Platform, UIManager} = ReactNative;

const dismissKeyboard = require('react-native/Libraries/Utilities/dismissKeyboard');

import {childrenWithOverriddenStyle} from './utils';

const NativeViewPager = require('./ViewPagerNativeComponent');

const VIEW_PAGER_REF = 'viewPager';
const VIEW_MANAGER_NAME = 'RNCViewPager';

function getViewManagerConfig(viewManagerName) {
  if (!UIManager.getViewManagerConfig) {
    // react-native <= 0.57
    return UIManager[viewManagerName];
  }
  return UIManager.getViewManagerConfig(viewManagerName);
}

/**
 * Container that allows to flip left and right between child views. Each
 * child view of the `ViewPager` will be treated as a separate page
 * and will be stretched to fill the `ViewPager`.
 *
 * It is important all children are `<View>`s and not composite components.
 * You can set style properties like `padding` or `backgroundColor` for each
 * child. It is also important that each child have a `key` prop.
 *
 * Example:
 *
 * ```
 * render: function() {
 *   return (
 *     <ViewPager
 *       style={styles.viewPager}
 *       initialPage={0}>
 *       <View style={styles.pageStyle} key="1">
 *         <Text>First page</Text>
 *       </View>
 *       <View style={styles.pageStyle} key="2">
 *         <Text>Second page</Text>
 *       </View>
 *     </ViewPager>
 *   );
 * }
 *
 * ...
 *
 * var styles = {
 *   ...
 *   viewPager: {
 *     flex: 1
 *   },
 *   pageStyle: {
 *     alignItems: 'center',
 *     padding: 20,
 *   }
 * }
 * ```
 */

class ViewPager extends React.Component<ViewPagerProps> {
  componentDidMount() {
    // On iOS we do it directly on the native side
    if (Platform.OS === 'android') {
      if (this.props.initialPage != null) {
        this.setPageWithoutAnimation(this.props.initialPage);
      }
    }
  }

  /* $FlowFixMe(>=0.78.0 site=react_native_android_fb) This issue was found
   * when making Flow check .android.js files. */
  getInnerViewNode = (): ReactComponent => {
    return this.refs[VIEW_PAGER_REF].getInnerViewNode();
  };

  _onPageScroll = (e: PageScrollEvent) => {
    if (this.props.onPageScroll) {
      this.props.onPageScroll(e);
    }
    // Not implemented on iOS yet
    if (Platform.OS === 'android') {
      if (this.props.keyboardDismissMode === 'on-drag') {
        dismissKeyboard();
      }
    }
  };

  _onPageScrollStateChanged = (e: PageScrollStateChangedEvent) => {
    if (this.props.onPageScrollStateChanged) {
      this.props.onPageScrollStateChanged(e);
    }
  };

  _onPageSelected = (e: PageSelectedEvent) => {
    if (this.props.onPageSelected) {
      this.props.onPageSelected(e);
    }
  };

  /**
   * A helper function to scroll to a specific page in the ViewPager.
   * The transition between pages will be animated.
   */
  setPage = (selectedPage: number) => {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this),
      getViewManagerConfig(VIEW_MANAGER_NAME).Commands.setPage,
      [selectedPage],
    );
  };

  /**
   * A helper function to scroll to a specific page in the ViewPager.
   * The transition between pages will *not* be animated.
   */
  setPageWithoutAnimation = (selectedPage: number) => {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this),
      getViewManagerConfig(VIEW_MANAGER_NAME).Commands.setPageWithoutAnimation,
      [selectedPage],
    );
  };

  render() {
    return (
      <NativeViewPager
        {...this.props}
        ref={VIEW_PAGER_REF}
        style={this.props.style}
        onPageScroll={this._onPageScroll}
        onPageScrollStateChanged={this._onPageScrollStateChanged}
        onPageSelected={this._onPageSelected}
        children={childrenWithOverriddenStyle(this.props.children)}
      />
    );
  }
}

module.exports = ViewPager;
