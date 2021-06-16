/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */
import React, { ReactNode } from 'react';
import type { PageIndicatorProps } from './types';
export declare const childrenWithOverriddenStyle: (children?: ReactNode) => React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | null | undefined;
export declare const transformPagerProps: (options?: PageIndicatorProps | undefined) => {
    activeDotColor: string;
    inactiveDotColor: string;
} | undefined;
