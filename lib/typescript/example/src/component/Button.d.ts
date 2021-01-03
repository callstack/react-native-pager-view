import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
declare type Props = {
    disabled?: boolean;
    onPress: () => void;
    text: string;
    style?: StyleProp<ViewStyle>;
};
export declare class Button extends React.Component<Props> {
    _handlePress: () => void;
    render(): JSX.Element;
}
export {};
