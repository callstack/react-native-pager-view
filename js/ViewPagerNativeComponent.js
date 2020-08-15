/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const {requireNativeComponent} = require('react-native');

import type {HostComponent} from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';

import type {ViewPagerProps} from './types';

type ViewPagerNativeType = HostComponent<ViewPagerProps>;

module.exports = ((requireNativeComponent(
  'RNCViewPager',
): any): ViewPagerNativeType);
