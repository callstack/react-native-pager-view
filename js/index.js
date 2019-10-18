/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {PageScrollState as _PageScrollState} from './types';
import type {PageScrollEvent as _PageScrollEvent} from './types';
import type {PageScrollStateChangedEvent as _PageScrollStateChangedEvent} from './types';
import type {PageSelectedEvent as _PageSelectedEvent} from './types';
import type {TransitionStyle as _TransitionStyle} from './types';
import type {Orientation as _Orientation} from './types';

export type PageScrollState = _PageScrollState;
export type PageScrollEvent = _PageScrollEvent;
export type PageScrollStateChangedEvent = _PageScrollStateChangedEvent;
export type PageSelectedEvent = _PageSelectedEvent;
export type TransitionStyle = _TransitionStyle;
export type Orientation = _Orientation;

module.exports = require('./ViewPager');
