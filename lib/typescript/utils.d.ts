/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */
import { ReactNode } from 'react';
/**
 * Get element keys, cast to strings, from the children opaque data structure.
 */
export declare function getReactStringKeys(children: ReactNode | ReactNode[]): string[];
