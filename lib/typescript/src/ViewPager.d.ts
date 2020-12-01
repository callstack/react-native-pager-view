import React, { ReactElement } from 'react';
import type { ViewPagerProps } from './types';
/**
 * Container that allows to flip left and right between child views. Each
 * child view of the `ViewPager` will be treated as a separate page
 * and will be stretched to fill the `ViewPager`.
 *
 * It is important all children are `<View>`s and not composite components.
 * You can set style properties like `padding` or `backgroundColor` for each
 * child. It is also important that each child have a `key` prop.
 *
 * Example:
 *
 * ```
 * render: function() {
 *   return (
 *     <ViewPager
 *       style={styles.viewPager}
 *       initialPage={0}>
 *       <View style={styles.pageStyle} key="1">
 *         <Text>First page</Text>
 *       </View>
 *       <View style={styles.pageStyle} key="2">
 *         <Text>Second page</Text>
 *       </View>
 *     </ViewPager>
 *   );
 * }
 *
 * ...
 *
 * var styles = {
 *   ...
 *   viewPager: {
 *     flex: 1
 *   },
 *   pageStyle: {
 *     alignItems: 'center',
 *     padding: 20,
 *   }
 * }
 * ```
 */
export declare class ViewPager extends React.Component<ViewPagerProps> {
    private isScrolling;
    private viewPager;
    componentDidMount(): void;
    getInnerViewNode: () => ReactElement;
    private _onPageScroll;
    private _onPageScrollStateChanged;
    private _onPageSelected;
    /**
     * A helper function to scroll to a specific page in the ViewPager.
     * The transition between pages will be animated.
     */
    setPage: (selectedPage: number) => void;
    /**
     * A helper function to scroll to a specific page in the ViewPager.
     * The transition between pages will *not* be animated.
     */
    setPageWithoutAnimation: (selectedPage: number) => void;
    /**
     * A helper function to enable/disable scroll imperatively
     * The recommended way is using the scrollEnabled prop, however, there might be a case where a
     * imperative solution is more useful (e.g. for not blocking an animation)
     */
    setScrollEnabled: (scrollEnabled: boolean) => void;
    private _onMoveShouldSetResponderCapture;
    render(): JSX.Element;
}
