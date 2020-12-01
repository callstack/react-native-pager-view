import type { ReactElement } from 'react';
import { HostComponent } from 'react-native';
import type { ViewPagerProps } from './types';
interface ViewpagerViewManagerType extends HostComponent<ViewPagerProps> {
    getInnerViewNode(): ReactElement;
}
export declare const ViewpagerViewManager: ViewpagerViewManagerType;
export declare function getViewManagerConfig(viewManagerName?: string): {
    Commands: {
        [key: string]: number;
    };
};
export {};
