"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getViewManagerConfig = getViewManagerConfig;
exports.PagerViewViewManager = void 0;

var _reactNative = require("react-native");

const VIEW_MANAGER_NAME = 'RNCViewPager';
const PagerViewViewManager = (0, _reactNative.requireNativeComponent)(VIEW_MANAGER_NAME);
exports.PagerViewViewManager = PagerViewViewManager;

function getViewManagerConfig(viewManagerName = VIEW_MANAGER_NAME) {
  return _reactNative.UIManager.getViewManagerConfig(viewManagerName);
}
//# sourceMappingURL=PagerViewNative.js.map