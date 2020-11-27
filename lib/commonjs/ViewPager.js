"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewPager = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactNative = _interopRequireWildcard(require("react-native"));

var _utils = require("./utils");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const VIEW_MANAGER_NAME = 'RNCViewPager';
const VIEW_PAGER_REF = 'viewPager';
const ViewpagerViewManager = (0, _reactNative.requireNativeComponent)(VIEW_MANAGER_NAME);

function getViewManagerConfig(viewManagerName) {
  return _reactNative.UIManager.getViewManagerConfig(viewManagerName);
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


class ViewPager extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "isScrolling", false);

    _defineProperty(this, "getInnerViewNode", () => {
      return this.refs[VIEW_PAGER_REF].getInnerViewNode();
    });

    _defineProperty(this, "_onPageScroll", e => {
      if (this.props.onPageScroll) {
        this.props.onPageScroll(e);
      } // Not implemented on iOS yet


      if (_reactNative.Platform.OS === 'android') {
        if (this.props.keyboardDismissMode === 'on-drag') {
          _reactNative.Keyboard.dismiss(); // dismissKeyboard();

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
      _reactNative.UIManager.dispatchViewManagerCommand(_reactNative.default.findNodeHandle(this), getViewManagerConfig(VIEW_MANAGER_NAME).Commands.setPage, [selectedPage]);
    });

    _defineProperty(this, "setPageWithoutAnimation", selectedPage => {
      _reactNative.UIManager.dispatchViewManagerCommand(_reactNative.default.findNodeHandle(this), getViewManagerConfig(VIEW_MANAGER_NAME).Commands.setPageWithoutAnimation, [selectedPage]);
    });

    _defineProperty(this, "setScrollEnabled", scrollEnabled => {
      _reactNative.UIManager.dispatchViewManagerCommand(_reactNative.default.findNodeHandle(this), getViewManagerConfig(VIEW_MANAGER_NAME).Commands.setScrollEnabled, [scrollEnabled]);
    });

    _defineProperty(this, "_onMoveShouldSetResponderCapture", () => {
      if (_reactNative.Platform.OS === 'ios') {
        return this.isScrolling;
      }

      return false;
    });
  }

  componentDidMount() {
    // On iOS we do it directly on the native side
    if (_reactNative.Platform.OS === 'android') {
      if (this.props.initialPage != null) {
        this.setPageWithoutAnimation(this.props.initialPage);
      }
    }
  }
  /* $FlowFixMe(>=0.78.0 site=react_native_android_fb) This issue was found
   * when making Flow check .android.js files. */


  render() {
    return /*#__PURE__*/_react.default.createElement(ViewpagerViewManager, _extends({}, this.props, {
      ref: VIEW_PAGER_REF,
      style: this.props.style,
      onPageScroll: this._onPageScroll,
      onPageScrollStateChanged: this._onPageScrollStateChanged,
      onPageSelected: this._onPageSelected,
      onMoveShouldSetResponderCapture: this._onMoveShouldSetResponderCapture,
      children: (0, _utils.childrenWithOverriddenStyle)(this.props.children)
    }));
  }

}

exports.ViewPager = ViewPager;
//# sourceMappingURL=ViewPager.js.map