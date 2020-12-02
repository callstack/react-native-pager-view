/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import React from 'react';
declare type Props = {};
declare type State = {
    likes: number;
};
export declare class LikeCount extends React.Component<Props, State> {
    state: {
        likes: number;
    };
    onClick: () => void;
    render(): JSX.Element;
}
export {};
