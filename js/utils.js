/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';

export const childrenWithOverriddenStyle = (
  children?: React.Node,
): Array<React.Node> => {
  // Override styles so that each page will fill the parent. Native component
  // will handle positioning of elements, so it's not important to offset
  // them correctly.
  return React.Children.map(children, function(child) {
    if (!child) {
      return null;
    }
    const newProps = {
      ...child.props,
      style: [
        child.props.style,
        {
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: undefined,
          height: undefined,
        },
      ],
      collapsable: false,
    };
    return React.createElement(child.type, newProps);
  });
};
