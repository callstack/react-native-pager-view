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

import type {NativeComponent} from 'react-native/Libraries/Renderer/shims/ReactNative';

import type {ViewPagerProps} from './types';

type ViewPagerNativeType = Class<NativeComponent<ViewPagerProps>>;

module.exports = ((requireNativeComponent(
  'RNCViewPager',
): any): ViewPagerNativeType);
