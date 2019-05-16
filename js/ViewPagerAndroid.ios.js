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
import { requireNativeComponent } from 'react-native';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import React from "react";
const NativeAndroidViewPager = require('./AndroidViewPagerNativeComponent');

type TransitionStyle = 'scroll' | 'curl'
type Orientation = 'horizontal' | 'vertical'

type Props = $ReadOnly<{|
    /**
     * Index of initial page that should be selected. Use `setPage` method to
     * update the page, and `onPageSelected` to monitor page changes
     */
    orientation?: ?Orientation,
    transitionStyle?: ?TransitionStyle,
    pageMargin?: ?number,
    scrollEnabled?: ?number,
    initialPage?: ?number,
    style?: ?ViewStyleProp,
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

class ViewPagerAndroid extends React.Component<Props> {
    

  
    render() {
      return (
        <NativeAndroidViewPager
          {...this.props}
          ref={VIEWPAGER_REF}
          style={this.props.style}
        />
      );
    }
  }

// module.exports = requireNativeComponent('RNCViewPager');
module.exports = ViewPagerAndroid;
