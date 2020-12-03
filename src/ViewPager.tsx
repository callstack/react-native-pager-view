import React, { ReactElement } from 'react';
import { Platform, UIManager, Keyboard } from 'react-native';
import ReactNative from 'react-native';
import type {
  ViewPagerOnPageScrollEvent,
  ViewPagerOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
  ViewPagerProps,
} from './types';

import { childrenWithOverriddenStyle } from './utils';
import { getViewManagerConfig, ViewpagerViewManager } from './ViewPagerNative';

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

export class ViewPager extends React.Component<ViewPagerProps> {
  private isScrolling = false;
  private viewPager = React.createRef<typeof ViewpagerViewManager>();

  componentDidMount() {
    // On iOS we do it directly on the native side
    if (Platform.OS === 'android') {
      if (this.props.initialPage != null) {
        this.setPageWithoutAnimation(this.props.initialPage);
      }
    }
  }

  public getInnerViewNode = (): ReactElement => {
    return this.viewPager.current!.getInnerViewNode();
  };

  private _onPageScroll = (e: ViewPagerOnPageScrollEvent) => {
    if (this.props.onPageScroll) {
      this.props.onPageScroll(e);
    }
    // Not implemented on iOS yet
    if (Platform.OS === 'android') {
      if (this.props.keyboardDismissMode === 'on-drag') {
        Keyboard.dismiss();
      }
    }
  };

  private _onPageScrollStateChanged = (
    e: PageScrollStateChangedNativeEvent
  ) => {
    if (this.props.onPageScrollStateChanged) {
      this.props.onPageScrollStateChanged(e);
    }
    this.isScrolling = e.nativeEvent.pageScrollState === 'dragging';
  };

  private _onPageSelected = (e: ViewPagerOnPageSelectedEvent) => {
    if (this.props.onPageSelected) {
      this.props.onPageSelected(e);
    }
  };

  /**
   * A helper function to scroll to a specific page in the ViewPager.
   * The transition between pages will be animated.
   */
  public setPage = (selectedPage: number) => {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this),
      getViewManagerConfig().Commands.setPage,
      [selectedPage]
    );
  };

  /**
   * A helper function to scroll to a specific page in the ViewPager.
   * The transition between pages will *not* be animated.
   */
  public setPageWithoutAnimation = (selectedPage: number) => {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this),
      getViewManagerConfig().Commands.setPageWithoutAnimation,
      [selectedPage]
    );
  };

  /**
   * A helper function to enable/disable scroll imperatively
   * The recommended way is using the scrollEnabled prop, however, there might be a case where a
   * imperative solution is more useful (e.g. for not blocking an animation)
   */
  public setScrollEnabled = (scrollEnabled: boolean) => {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this),
      getViewManagerConfig().Commands.setScrollEnabled,
      [scrollEnabled]
    );
  };

  private _onMoveShouldSetResponderCapture = () => {
    return this.isScrolling;
  };

  render() {
    return (
      <ViewpagerViewManager
        {...this.props}
        ref={this.viewPager as any /** TODO: Fix ref type */}
        style={this.props.style}
        onPageScroll={this._onPageScroll}
        onPageScrollStateChanged={this._onPageScrollStateChanged}
        onPageSelected={this._onPageSelected}
        onMoveShouldSetResponderCapture={this._onMoveShouldSetResponderCapture}
        children={childrenWithOverriddenStyle(this.props.children)}
      />
    );
  }
}
