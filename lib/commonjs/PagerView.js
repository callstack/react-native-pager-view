"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PagerView = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactNative = require("react-native");

var _PagerViewNative = require("./PagerViewNative");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PagerView extends _react.default.PureComponent {
  constructor(props) {
    var _props$initialPage;

    super(props);

    _defineProperty(this, "isScrolling", false);

    _defineProperty(this, "onMoveShouldSetResponderCapture", () => this.isScrolling);

    _defineProperty(this, "onPageScroll", event => {
      var _this$props$onPageScr, _this$props;

      (_this$props$onPageScr = (_this$props = this.props).onPageScroll) === null || _this$props$onPageScr === void 0 ? void 0 : _this$props$onPageScr.call(_this$props, event);

      if (this.props.keyboardDismissMode === 'on-drag') {
        _reactNative.Keyboard.dismiss();
      }
    });

    _defineProperty(this, "onPageScrollStateChanged", event => {
      var _this$props$onPageScr2, _this$props2;

      (_this$props$onPageScr2 = (_this$props2 = this.props).onPageScrollStateChanged) === null || _this$props$onPageScr2 === void 0 ? void 0 : _this$props$onPageScr2.call(_this$props2, event);
      this.isScrolling = event.nativeEvent.pageScrollState === 'dragging';
    });

    _defineProperty(this, "onPageSelected", event => {
      var _this$props$onPageSel, _this$props3;

      const currentPage = event.nativeEvent.position;
      this.setState(prevState => this.computeRenderWindow({
        buffer: this.props.buffer,
        currentPage,
        maxRenderWindow: this.props.maxRenderWindow,
        offset: prevState.offset,
        windowLength: prevState.windowLength
      }));
      (_this$props$onPageSel = (_this$props3 = this.props).onPageSelected) === null || _this$props$onPageSel === void 0 ? void 0 : _this$props$onPageSel.call(_this$props3, event);
    });

    this.state = this.computeRenderWindow({
      buffer: props.buffer,
      currentPage: (_props$initialPage = props.initialPage) !== null && _props$initialPage !== void 0 ? _props$initialPage : 0,
      maxRenderWindow: props.maxRenderWindow,
      offset: 0,
      windowLength: 0
    });
  }

  componentDidMount() {
    if (this.props.initialPage != null && this.props.initialPage > 0) {
      // Send command directly; render window already contains destination.
      _reactNative.UIManager.dispatchViewManagerCommand((0, _reactNative.findNodeHandle)(this), 'setPage', [this.props.initialPage, false]);
    }
  }
  /**
   * A helper function to scroll to a specific page in the PagerView.
   * Default to animated transition between pages.
   */


  setPage(page, animated = true) {
    if (page < 0 || page >= this.props.data.length) {
      return;
    } // Start rendering the destination.


    this.setState(prevState => this.computeRenderWindow({
      buffer: this.props.buffer,
      currentPage: page,
      maxRenderWindow: this.props.maxRenderWindow,
      offset: prevState.offset,
      windowLength: prevState.windowLength
    })); // Send paging command.

    requestAnimationFrame(() => {
      _reactNative.UIManager.dispatchViewManagerCommand((0, _reactNative.findNodeHandle)(this), 'setPage', [page, animated]);
    });
  }
  /**
   * A helper function to scroll to a specific page in the PagerView.
   * The transition between pages will *not* be animated.
   */


  setPageWithoutAnimation(page) {
    this.setPage(page, false);
  }
  /**
   * A helper function to enable/disable scroll imperatively.
   * The recommended way is using the scrollEnabled prop, however, there might
   * be a case where an imperative solution is more useful (e.g. for not
   * blocking an animation)
   */


  setScrollEnabled(scrollEnabled) {
    _reactNative.UIManager.dispatchViewManagerCommand((0, _reactNative.findNodeHandle)(this), 'setScrollEnabled', [scrollEnabled]);
  }
  /**
   * Compute desired render window size.
   *
   * Returns `offset` and `windowLength` unmodified, unless in conflict with
   * restrictions from `buffer` or `maxRenderWindow`.
   */


  computeRenderWindow(data) {
    var _data$buffer, _data$maxRenderWindow;

    const buffer = Math.max((_data$buffer = data.buffer) !== null && _data$buffer !== void 0 ? _data$buffer : 1, 1);
    let offset = Math.max(Math.min(data.offset, data.currentPage - buffer), 0);
    let windowLength = Math.max(data.offset + data.windowLength, data.currentPage + buffer + 1) - offset;
    let maxRenderWindow = (_data$maxRenderWindow = data.maxRenderWindow) !== null && _data$maxRenderWindow !== void 0 ? _data$maxRenderWindow : 0;

    if (maxRenderWindow !== 0) {
      maxRenderWindow = Math.max(maxRenderWindow, 1 + 2 * buffer);

      if (windowLength > maxRenderWindow) {
        offset = data.currentPage - Math.floor(maxRenderWindow / 2);
        windowLength = maxRenderWindow;
      }
    }

    return {
      offset,
      windowLength
    };
  }

  renderChildren(offset, windowLength) {
    const keys = [];
    return {
      children: this.props.data.slice(offset, offset + windowLength).map((item, index) => {
        const key = this.props.keyExtractor(item, offset + index);
        keys.push(key);
        return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
          collapsable: false,
          key: key,
          style: styles.pageContainer
        }, this.props.renderItem({
          item,
          index: offset + index
        }));
      }),
      keys
    };
  }

  render() {
    const {
      offset,
      windowLength
    } = this.state;
    const {
      children,
      keys
    } = this.renderChildren(offset, windowLength);
    return /*#__PURE__*/_react.default.createElement(_PagerViewNative.PagerViewNative, {
      childrenKeys: keys,
      count: this.props.data.length,
      offscreenPageLimit: this.props.offscreenPageLimit,
      offset: offset,
      onMoveShouldSetResponderCapture: this.onMoveShouldSetResponderCapture,
      onPageScroll: this.onPageScroll,
      onPageScrollStateChanged: this.onPageScrollStateChanged,
      onPageSelected: this.onPageSelected,
      orientation: this.props.orientation,
      overdrag: this.props.overdrag,
      pageMargin: this.props.pageMargin,
      scrollEnabled: this.props.scrollEnabled,
      showPageIndicator: this.props.showPageIndicator,
      style: this.props.style,
      transitionStyle: this.props.transitionStyle
    }, children);
  }

}

exports.PagerView = PagerView;

const styles = _reactNative.StyleSheet.create({
  pageContainer: {
    height: '100%',
    position: 'absolute',
    width: '100%'
  }
});
//# sourceMappingURL=PagerView.js.map