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

export const childrenWithOverriddenStyle = (children?: React.Node): Array<React.Node> => {
  // Override styles so that each page will fill the parent. Native component
  // will handle positioning of elements, so it's not important to offset
  // them correctly.
  return React.Children.map(children, function(child) {
    if (!child) {
      return null;
    }
    if (
      child.type &&
      child.type.displayName &&
      child.type.displayName !== 'RCTView' &&
      child.type.displayName !== 'View'
    ) {
      console.warn(
        'Each ViewPager child must be a <View>. Was ' +
        child.type.displayName,
      );
    }
    return React.createElement(child.type, child.props);
  });
};
