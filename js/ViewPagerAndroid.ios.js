/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const VIEWPAGER_REF = 'viewPager';

import ReactNative, {UIManager} from 'react-native'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import React from "react";
import NativeAndroidViewPager from './AndroidViewPagerNativeComponent';

type TransitionStyle = 'scroll' | 'curl'
type Orientation = 'horizontal' | 'vertical'

type PageSelectedEvent = SyntheticEvent<
  $ReadOnly<{|
    position: number,
  |}>,
>;

type Props = $ReadOnly<{|
    /**
     * Index of initial page that should be selected. Use `setPage` method to
     * update the page, and `onPageSelected` to monitor page changes
     */
    onPageSelected?: (e: PageSelectedEvent) => void,
    orientation?: Orientation,
    transitionStyle?: TransitionStyle,
    pageMargin?: number,
    scrollEnabled?: boolean,
    initialPage?: number,
    style?: ?ViewStyleProp,
    keyboardDismissMode?: ?('none' | 'on-drag'),
  |}>;
  
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

class ViewPagerAndroid extends React.Component<Props> {
  
  _childrenWithOverridenStyle = (): Array => {
    // Override styles so that each page will fill the parent. Native component
    // will handle positioning of elements, so it's not important to offset
    // them correctly.
    return React.Children.map(this.props.children, function(child) {
      if (!child) {
        return null;
      }
      const newProps = {
        ...child.props,
        style: [
          child.props.style,
          {
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: undefined,
            height: undefined,
          },
        ],
        collapsable: false,
      };
      if (
        child.type &&
        child.type.displayName &&
        child.type.displayName !== 'RCTView' &&
        child.type.displayName !== 'View'
      ) {
        console.warn(
          'Each ViewPager child must be a <View>. Was ' +
            child.type.displayName,
        );
      }
      return React.createElement(child.type, newProps);
    });
  };
  
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
          children={this._childrenWithOverridenStyle()}
        />
      );
    }
  }

module.exports = ViewPagerAndroid;
