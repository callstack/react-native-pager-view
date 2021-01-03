import React from 'react';
declare type Props = {
    progress: {
        position: number;
        offset: number;
    };
    numberOfPages: number;
};
export declare class ProgressBar extends React.Component<Props> {
    render(): JSX.Element;
}
export {};
