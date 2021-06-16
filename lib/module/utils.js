/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 */
import React, { Children } from 'react';
import { processColor } from 'react-native';
export const childrenWithOverriddenStyle = children => {
  // Override styles so that each page will fill the parent. Native component
  // will handle positioning of elements, so it's not important to offset
  // them correctly.
  return Children.map(children, child => {
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
    return /*#__PURE__*/React.cloneElement(child, newProps);
  });
};
export const transformPagerProps = options => {
  if (!options) {
    return undefined;
  }

  const {
    activeDotColor = '#000',
    inactiveDotColor = '#fff'
  } = options;
  return {
    activeDotColor: `#${processColor(activeDotColor).toString(16)}`,
    inactiveDotColor: `#${processColor(inactiveDotColor).toString(16)}`
  };
};
//# sourceMappingURL=utils.js.map