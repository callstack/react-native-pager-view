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

import type {ViewPagerProps} from "./types";

const VIEWPAGER_REF = 'viewPager';

import * as React from "react";
import ReactNative, {UIManager} from 'react-native'
import NativeAndroidViewPager from './AndroidViewPagerNativeComponent';
import {childrenWithOverriddenStyle} from "./utils";

  /**
   * Container that allows to flip left and right between child views. Each
   * child view of the `ViewPagerAndroid` will be treated as a separate page
   * and will be stretched to fill the `ViewPagerAndroid`.
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
   *     <ViewPagerAndroid
   *       style={styles.viewPager}
   *       initialPage={0}>
   *       <View style={styles.pageStyle} key="1">
   *         <Text>First page</Text>
   *       </View>
   *       <View style={styles.pageStyle} key="2">
   *         <Text>Second page</Text>
   *       </View>
   *     </ViewPagerAndroid>
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

function getViewManagerConfig(viewManagerName) {
  if (!UIManager.getViewManagerConfig) {
    // react-native <= 0.57
    return UIManager[viewManagerName];
  }
  return UIManager.getViewManagerConfig(viewManagerName);
}

class ViewPagerAndroid extends React.Component<ViewPagerProps> {
  setPage = (selectedPage: number) => {
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(this),
        getViewManagerConfig('RNCViewPager').Commands.goToPage,
        [selectedPage,true],
      );
    };

    setPageWithoutAnimation = (selectedPage: number) => {
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(this),
        getViewManagerConfig('RNCViewPager').Commands.goToPage,
        [selectedPage,false],
      );
    };

    render() {
      return (
        <NativeAndroidViewPager
          {...this.props}
          ref={VIEWPAGER_REF}
          children={childrenWithOverriddenStyle(this.props.children)}
        />
      );
    }
  }

module.exports = ViewPagerAndroid;
