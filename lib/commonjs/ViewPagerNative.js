"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getViewManagerConfig = getViewManagerConfig;
exports.ViewpagerViewManager = void 0;

var _reactNative = require("react-native");

const VIEW_MANAGER_NAME = 'RNCViewPager';
const ViewpagerViewManager = (0, _reactNative.requireNativeComponent)(VIEW_MANAGER_NAME);
exports.ViewpagerViewManager = ViewpagerViewManager;

function getViewManagerConfig(viewManagerName = VIEW_MANAGER_NAME) {
  return _reactNative.UIManager.getViewManagerConfig(viewManagerName);
}
//# sourceMappingURL=ViewPagerNative.js.map