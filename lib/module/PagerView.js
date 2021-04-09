function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from 'react';
import { Platform, UIManager, Keyboard } from 'react-native';
import ReactNative from 'react-native';
import { childrenWithOverriddenStyle } from './utils';
import { getViewManagerConfig, PagerViewViewManager } from './PagerViewNative';
/**
 * Container that allows to flip left and right between child views. Each
 * child view of the `PagerView` will be treated as a separate page
 * and will be stretched to fill the `PagerView`.
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
 *     <PagerView
 *       style={styles.PagerView}
 *       initialPage={0}>
 *       <View style={styles.pageStyle} key="1">
 *         <Text>First page</Text>
 *       </View>
 *       <View style={styles.pageStyle} key="2">
 *         <Text>Second page</Text>
 *       </View>
 *     </PagerView>
 *   );
 * }
 *
 * ...
 *
 * var styles = {
 *   ...
 *   PagerView: {
 *     flex: 1
 *   },
 *   pageStyle: {
 *     alignItems: 'center',
 *     padding: 20,
 *   }
 * }
 * ```
 */

export class PagerView extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "isScrolling", false);

    _defineProperty(this, "PagerView", /*#__PURE__*/React.createRef());

    _defineProperty(this, "getInnerViewNode", () => {
      return this.PagerView.current.getInnerViewNode();
    });

    _defineProperty(this, "_onPageScroll", e => {
      if (this.props.onPageScroll) {
        this.props.onPageScroll(e);
      } // Not implemented on iOS yet


      if (Platform.OS === 'android') {
        if (this.props.keyboardDismissMode === 'on-drag') {
          Keyboard.dismiss();
        }
      }
    });

    _defineProperty(this, "_onPageScrollStateChanged", e => {
      if (this.props.onPageScrollStateChanged) {
        this.props.onPageScrollStateChanged(e);
      }

      this.isScrolling = e.nativeEvent.pageScrollState === 'dragging';
    });

    _defineProperty(this, "_onPageSelected", e => {
      if (this.props.onPageSelected) {
        this.props.onPageSelected(e);
      }
    });

    _defineProperty(this, "setPage", selectedPage => {
      UIManager.dispatchViewManagerCommand(ReactNative.findNodeHandle(this), getViewManagerConfig().Commands.setPage, [selectedPage]);
    });

    _defineProperty(this, "setPageWithoutAnimation", selectedPage => {
      UIManager.dispatchViewManagerCommand(ReactNative.findNodeHandle(this), getViewManagerConfig().Commands.setPageWithoutAnimation, [selectedPage]);
    });

    _defineProperty(this, "setScrollEnabled", scrollEnabled => {
      UIManager.dispatchViewManagerCommand(ReactNative.findNodeHandle(this), getViewManagerConfig().Commands.setScrollEnabled, [scrollEnabled]);
    });

    _defineProperty(this, "_onMoveShouldSetResponderCapture", () => {
      return this.isScrolling;
    });
  }

  componentDidMount() {
    // On iOS we do it directly on the native side
    if (Platform.OS === 'android' && this.props.initialPage !== undefined) {
      requestAnimationFrame(() => {
        if (this.props.initialPage !== undefined) {
          this.setPageWithoutAnimation(this.props.initialPage);
        }
      });
    }
  }

  render() {
    return /*#__PURE__*/React.createElement(PagerViewViewManager, _extends({}, this.props, {
      ref: this.PagerView
      /** TODO: Fix ref type */
      ,
      style: this.props.style,
      onPageScroll: this._onPageScroll,
      onPageScrollStateChanged: this._onPageScrollStateChanged,
      onPageSelected: this._onPageSelected,
      onMoveShouldSetResponderCapture: this._onMoveShouldSetResponderCapture,
      children: childrenWithOverriddenStyle(this.props.children)
    }));
  }

}
//# sourceMappingURL=PagerView.js.map