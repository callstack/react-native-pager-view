"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LazyPagerView = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactNative = require("react-native");

var _PagerViewNative = require("./PagerViewNative");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * PagerView implementation that renders pages when needed (lazy loading)
 */
class LazyPagerView extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "pagerImplRef", /*#__PURE__*/_react.default.createRef());
  }

  setPage(page) {
    var _this$pagerImplRef$cu;

    (_this$pagerImplRef$cu = this.pagerImplRef.current) === null || _this$pagerImplRef$cu === void 0 ? void 0 : _this$pagerImplRef$cu.setPage(page, true);
  }

  setPageWithoutAnimation(page) {
    var _this$pagerImplRef$cu2;

    (_this$pagerImplRef$cu2 = this.pagerImplRef.current) === null || _this$pagerImplRef$cu2 === void 0 ? void 0 : _this$pagerImplRef$cu2.setPage(page, false);
  }

  setScrollEnabled(scrollEnabled) {
    var _this$pagerImplRef$cu3;

    (_this$pagerImplRef$cu3 = this.pagerImplRef.current) === null || _this$pagerImplRef$cu3 === void 0 ? void 0 : _this$pagerImplRef$cu3.setScrollEnabled(scrollEnabled);
  }

  render() {
    const {
      style,
      ...implProps
    } = this.props;
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: style
    }, /*#__PURE__*/_react.default.createElement(LazyPagerViewImpl, _extends({}, implProps, {
      ref: this.pagerImplRef
    })));
  }

}

exports.LazyPagerView = LazyPagerView;

class LazyPagerViewImpl extends _react.default.Component {
  constructor(props) {
    var _this$props$initialPa;

    super(props);

    _defineProperty(this, "isNavigatingToPage", null);

    _defineProperty(this, "isScrolling", false);

    _defineProperty(this, "animationFrameRequestId", void 0);

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

      const currentPage = event.nativeEvent.position; // Ignore spurious events that can occur on mount with `initialPage`.
      // TODO: Is there a way to avoid triggering the events at all?

      if (this.isNavigatingToPage != null) {
        if (this.isNavigatingToPage === currentPage) {
          this.isNavigatingToPage = null;
        } else {
          // Ignore event.
          return;
        }
      } // Queue renders for next needed pages (if not already available).


      requestAnimationFrame(() => {
        this.setState(prevState => this.computeRenderWindow({
          buffer: this.props.buffer,
          currentPage,
          maxRenderWindow: this.props.maxRenderWindow,
          offset: prevState.offset,
          windowLength: prevState.windowLength
        }));
      });
      (_this$props$onPageSel = (_this$props3 = this.props).onPageSelected) === null || _this$props$onPageSel === void 0 ? void 0 : _this$props$onPageSel.call(_this$props3, event);
    });

    const initialPage = Math.max((_this$props$initialPa = this.props.initialPage) !== null && _this$props$initialPa !== void 0 ? _this$props$initialPa : 0, 0);
    this.state = this.computeRenderWindow({
      buffer: props.buffer,
      currentPage: initialPage,
      maxRenderWindow: props.maxRenderWindow,
      offset: initialPage,
      windowLength: 0
    });
  }

  componentWillUnmount() {
    if (this.animationFrameRequestId !== undefined) {
      cancelAnimationFrame(this.animationFrameRequestId);
    }
  }

  componentDidMount() {
    const initialPage = this.props.initialPage;

    if (initialPage != null && initialPage > 0) {
      this.isNavigatingToPage = initialPage;
      this.animationFrameRequestId = requestAnimationFrame(() => {
        // Send command directly; render window already contains destination.
        _reactNative.UIManager.dispatchViewManagerCommand((0, _reactNative.findNodeHandle)(this), (0, _PagerViewNative.getViewManagerConfig)().Commands.setPageWithoutAnimation, [initialPage]);
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const stateKeys = ['offset', 'windowLength'];

    for (const stateKey of stateKeys) {
      if (this.state[stateKey] !== nextState[stateKey]) {
        return true;
      }
    }

    const propKeys = ['data', 'keyExtractor', 'offscreenPageLimit', 'orientation', 'overdrag', 'overScrollMode', 'pageMargin', 'renderItem', 'scrollEnabled', 'showPageIndicator', 'transitionStyle'];

    for (const propKey of propKeys) {
      if (this.props[propKey] !== nextProps[propKey]) {
        return true;
      }
    }

    return false;
  }
  /**
   * A helper function to scroll to a specific page in the PagerView.
   */


  setPage(page, animated) {
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

    setImmediate(() => {
      _reactNative.UIManager.dispatchViewManagerCommand((0, _reactNative.findNodeHandle)(this), animated ? (0, _PagerViewNative.getViewManagerConfig)().Commands.setPage : (0, _PagerViewNative.getViewManagerConfig)().Commands.setPageWithoutAnimation, [page]);
    });
  }
  /**
   * A helper function to enable/disable scroll imperatively.
   * The recommended way is using the scrollEnabled prop, however, there might
   * be a case where an imperative solution is more useful (e.g. for not
   * blocking an animation)
   */


  setScrollEnabled(scrollEnabled) {
    _reactNative.UIManager.dispatchViewManagerCommand((0, _reactNative.findNodeHandle)(this), (0, _PagerViewNative.getViewManagerConfig)().Commands.setScrollEnabled, [scrollEnabled]);
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
    const maxRenderWindowLowerBound = 1 + 2 * buffer;
    let offset = Math.max(Math.min(data.offset, data.currentPage - buffer), 0);
    let windowLength = Math.max(data.offset + data.windowLength, data.currentPage + buffer + 1) - offset;
    let maxRenderWindow = (_data$maxRenderWindow = data.maxRenderWindow) !== null && _data$maxRenderWindow !== void 0 ? _data$maxRenderWindow : 0;

    if (maxRenderWindow !== 0) {
      if (maxRenderWindow < maxRenderWindowLowerBound) {
        console.warn(`maxRenderWindow too small. Increasing to ${maxRenderWindowLowerBound}`);
        maxRenderWindow = maxRenderWindowLowerBound;
      }

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
      children
    } = this.renderChildren(offset, windowLength);
    return /*#__PURE__*/_react.default.createElement(_PagerViewNative.PagerViewViewManager, {
      count: this.props.data.length,
      offscreenPageLimit: this.props.offscreenPageLimit,
      offset: offset,
      onMoveShouldSetResponderCapture: this.onMoveShouldSetResponderCapture,
      onPageScroll: this.onPageScroll,
      onPageScrollStateChanged: this.onPageScrollStateChanged,
      onPageSelected: this.onPageSelected,
      orientation: this.props.orientation,
      overdrag: this.props.overdrag,
      overScrollMode: this.props.overScrollMode,
      pageMargin: this.props.pageMargin,
      scrollEnabled: this.props.scrollEnabled,
      showPageIndicator: this.props.showPageIndicator,
      style: styles.nativeView,
      transitionStyle: this.props.transitionStyle
    }, children);
  }

}

const styles = _reactNative.StyleSheet.create({
  nativeView: {
    flex: 1
  },
  pageContainer: {
    height: '100%',
    position: 'absolute',
    width: '100%'
  }
});
//# sourceMappingURL=LazyPagerView.js.map