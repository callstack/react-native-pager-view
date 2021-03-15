"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getReactStringKeys = getReactStringKeys;

var _react = require("react");

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 */

/**
 * Get element keys, cast to strings, from the children opaque data structure.
 */
function getReactStringKeys(children) {
  return _react.Children.toArray(children).map((child, index) => {
    if (typeof child === 'object' && 'key' in child && child.key != null) {
      return `${child.key}`;
    } else {
      return `${index}`;
    }
  });
}
//# sourceMappingURL=utils.js.map