/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import { Children, ReactNode } from 'react';

/**
 * Get element keys, cast to strings, from the children opaque data structure.
 */
export function getReactStringKeys(children: ReactNode | ReactNode[]) {
  return Children.toArray(children).map((child, index) => {
    if (typeof child === 'object' && 'key' in child && child.key != null) {
      return `${child.key}`;
    } else {
      return `${index}`;
    }
  });
}
