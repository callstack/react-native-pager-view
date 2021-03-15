import React from 'react';
import type { PagerViewProps, PagerViewState } from './types';
export declare class PagerView<ItemT> extends React.PureComponent<PagerViewProps<ItemT>, PagerViewState> {
    private isScrolling;
    constructor(props: PagerViewProps<ItemT>);
    componentDidMount(): void;
    /**
     * A helper function to scroll to a specific page in the PagerView.
     * Default to animated transition between pages.
     */
    setPage(page: number, animated?: boolean): void;
    /**
     * A helper function to scroll to a specific page in the PagerView.
     * The transition between pages will *not* be animated.
     */
    setPageWithoutAnimation(page: number): void;
    /**
     * A helper function to enable/disable scroll imperatively.
     * The recommended way is using the scrollEnabled prop, however, there might
     * be a case where an imperative solution is more useful (e.g. for not
     * blocking an animation)
     */
    setScrollEnabled(scrollEnabled: boolean): void;
    /**
     * Compute desired render window size.
     *
     * Returns `offset` and `windowLength` unmodified, unless in conflict with
     * restrictions from `buffer` or `maxRenderWindow`.
     */
    private computeRenderWindow;
    private onMoveShouldSetResponderCapture;
    private onPageScroll;
    private onPageScrollStateChanged;
    private onPageSelected;
    private renderChildren;
    render(): JSX.Element;
}
