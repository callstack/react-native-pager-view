"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.childrenWithOverriddenStyle = void 0;

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 */
const childrenWithOverriddenStyle = children => {
  // Override styles so that each page will fill the parent. Native component
  // will handle positioning of elements, so it's not important to offset
  // them correctly.
  return _react.Children.map(children, child => {
    const {
      props
    } = child;
    const newProps = { ...props,
      style: [props.style, {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: undefined,
        height: undefined
      }],
      collapsable: false
    };
    return /*#__PURE__*/_react.default.cloneElement(child, newProps);
  });
};

exports.childrenWithOverriddenStyle = childrenWithOverriddenStyle;
//# sourceMappingURL=utils.js.map