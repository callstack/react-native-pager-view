/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export const PAGES = 5;
export const BGCOLOR = ['#fdc08e', '#fff6b9', '#99d1b7', '#dde5fe', '#f79273'];
export const IMAGE_URIS = [
  'https://apod.nasa.gov/apod/image/1410/20141008tleBaldridge001h990.jpg',
  'https://apod.nasa.gov/apod/image/1409/volcanicpillar_vetter_960.jpg',
  'https://apod.nasa.gov/apod/image/1409/m27_snyder_960.jpg',
  'https://apod.nasa.gov/apod/image/1409/PupAmulti_rot0.jpg',
  'https://apod.nasa.gov/apod/image/1510/lunareclipse_27Sep_beletskycrop4.jpg',
];
export const thumbsUp = '\uD83D\uDC4D';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export type CreatePage = {
  key: number,
  style: ViewStyleProp,
  imgSource: {uri: string},
};

export const createPage = (key: number): CreatePage => {
  return {
    key: key,
    style: {
      backgroundColor: BGCOLOR[key % BGCOLOR.length],
      alignItems: 'center',
      padding: 20,
    },
    imgSource: {uri: IMAGE_URIS[key % BGCOLOR.length]},
  };
};
