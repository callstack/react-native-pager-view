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
