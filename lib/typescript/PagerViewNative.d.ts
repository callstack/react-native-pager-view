import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import type { Orientation, OverScrollMode, PagerViewOnPageScrollEvent, PagerViewOnPageSelectedEvent, PageScrollStateChangedNativeEvent, TransitionStyle } from './types';
declare type PagerViewNativeProps = {
    /**
     * Total number of pages. When lazy rendering, number of rendered react
     * children elements will be smaller.
     */
    count: number;
    offscreenPageLimit?: number;
    /**
     * Page position offset of the first rendered react child. I.e., the first
     * `offset` number of pages are not currently rendered on JS-side (so native
     * code should act accordingly).
     */
    offset: number;
    /**
     * If a parent `View` wants to prevent a child `View` from becoming responder
     * on a move, it should have this handler which returns `true`.
     *
     * `View.props.onMoveShouldSetResponderCapture: (event) => [true | false]`,
     * where `event` is a synthetic touch event as described above.
     *
     * See http://facebook.github.io/react-native/docs/view.html#onMoveShouldsetrespondercapture
     */
    onMoveShouldSetResponderCapture: (event: GestureResponderEvent) => boolean;
    onPageScroll: (event: PagerViewOnPageScrollEvent) => void;
    onPageScrollStateChanged: (event: PageScrollStateChangedNativeEvent) => void;
    onPageSelected: (event: PagerViewOnPageSelectedEvent) => void;
    orientation?: Orientation;
    overdrag?: boolean;
    overScrollMode?: OverScrollMode;
    pageMargin?: number;
    scrollEnabled?: boolean;
    showPageIndicator?: boolean;
    style: StyleProp<ViewStyle>;
    transitionStyle?: TransitionStyle;
};
export declare const PagerViewViewManager: import("react-native").HostComponent<PagerViewNativeProps>;
export declare function getViewManagerConfig(viewManagerName?: string): {
    Commands: {
        [key: string]: number;
    };
};
export {};
