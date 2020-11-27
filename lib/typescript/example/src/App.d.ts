import * as React from 'react';
import ViewPager, { PageScrollState, OverScrollMode, ViewPagerOnPageScrollEvent, ViewPagerOnPageSelectedEvent, PageScrollStateChangedNativeEvent } from 'react-native-viewpager';
import type { CreatePage } from './utils';
declare type State = {
    page: number;
    animationsAreEnabled: boolean;
    scrollEnabled: boolean;
    progress: {
        position: number;
        offset: number;
    };
    pages: Array<CreatePage>;
    scrollState: PageScrollState;
    dotsVisible: boolean;
    overScrollMode: OverScrollMode;
};
export default class ViewPagerExample extends React.Component<{}, State> {
    viewPager: React.RefObject<ViewPager>;
    constructor(props: any);
    onPageSelected: (e: ViewPagerOnPageSelectedEvent) => void;
    onPageScroll: (e: ViewPagerOnPageScrollEvent) => void;
    onPageScrollStateChanged: (e: PageScrollStateChangedNativeEvent) => void;
    addPage: () => void;
    removeLastPage: () => void;
    move: (delta: number) => void;
    go: (page: number) => void;
    renderPage(page: CreatePage): JSX.Element;
    toggleDotsVisibility: () => void;
    render(): JSX.Element;
}
export {};
