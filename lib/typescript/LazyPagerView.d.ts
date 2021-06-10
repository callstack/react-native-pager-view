import React from 'react';
import type { LazyPagerViewProps, Pageable } from './types';
/**
 * PagerView implementation that renders pages when needed (lazy loading)
 */
export declare class LazyPagerView<ItemT> extends React.PureComponent<LazyPagerViewProps<ItemT>> implements Pageable {
    private pagerImplRef;
    setPage(page: number): void;
    setPageWithoutAnimation(page: number): void;
    setScrollEnabled(scrollEnabled: boolean): void;
    render(): JSX.Element;
}
