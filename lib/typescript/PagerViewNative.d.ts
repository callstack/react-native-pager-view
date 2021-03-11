import type { ReactElement } from 'react';
import { HostComponent } from 'react-native';
import type { PagerViewProps } from './types';
interface PagerViewViewManagerType extends HostComponent<PagerViewProps> {
    getInnerViewNode(): ReactElement;
}
export declare const PagerViewViewManager: PagerViewViewManagerType;
export declare function getViewManagerConfig(viewManagerName?: string): {
    Commands: {
        [key: string]: number;
    };
};
export {};
