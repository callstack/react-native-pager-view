/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import React from 'react';
declare type Props = {
    progress: {
        position: number;
        offset: number;
    };
    numberOfPages: number;
    size: number;
};
export declare class ProgressBar extends React.Component<Props> {
    render(): JSX.Element;
}
export {};
