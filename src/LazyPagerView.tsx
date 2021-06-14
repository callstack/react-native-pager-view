import React from 'react';
import {
  findNodeHandle,
  InteractionManager,
  Keyboard,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';

import { getViewManagerConfig, PagerViewViewManager } from './PagerViewNative';
import type {
  LazyPagerViewProps,
  Pageable,
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
} from './types';

type LazyPagerViewImplProps<ItemT> = Omit<LazyPagerViewProps<ItemT>, 'style'>;
type LazyPagerViewImplState = { offset: number; windowLength: number };

type TaskHandle = ReturnType<typeof InteractionManager.runAfterInteractions>;

type RenderWindowData = {
  buffer: number | undefined;
  currentPage: number;
  maxRenderWindow: number | undefined;
  offset: number;
  windowLength: number;
};

/**
 * PagerView implementation that renders pages when needed (lazy loading)
 */
export class LazyPagerView<ItemT>
  extends React.PureComponent<LazyPagerViewProps<ItemT>>
  implements Pageable {
  private pagerImplRef = React.createRef<LazyPagerViewImpl<ItemT>>();

  setPage(page: number): void {
    this.pagerImplRef.current?.setPage(page, true);
  }

  setPageWithoutAnimation(page: number): void {
    this.pagerImplRef.current?.setPage(page, false);
  }

  setScrollEnabled(scrollEnabled: boolean): void {
    this.pagerImplRef.current?.setScrollEnabled(scrollEnabled);
  }

  render() {
    const { style, ...implProps } = this.props;

    return (
      <View style={style}>
        <LazyPagerViewImpl {...implProps} ref={this.pagerImplRef} />
      </View>
    );
  }
}

class LazyPagerViewImpl<ItemT> extends React.Component<
  LazyPagerViewImplProps<ItemT>,
  LazyPagerViewImplState
> {
  private isNavigatingToPage: number | null = null;
  private isScrolling = false;
  private animationFrameRequestId?: number;
  private renderRequestHandle?: TaskHandle;

  constructor(props: LazyPagerViewImplProps<ItemT>) {
    super(props);
    const initialPage = Math.max(this.props.initialPage ?? 0, 0);
    this.state = this.computeRenderWindow({
      buffer: props.buffer,
      currentPage: initialPage,
      maxRenderWindow: props.maxRenderWindow,
      offset: initialPage,
      windowLength: 0,
    });
  }

  componentWillUnmount() {
    if (this.animationFrameRequestId !== undefined) {
      cancelAnimationFrame(this.animationFrameRequestId);
    }
    if (this.renderRequestHandle != null) {
      this.renderRequestHandle.cancel();
    }
  }

  componentDidMount() {
    const initialPage = this.props.initialPage;
    if (initialPage != null && initialPage > 0) {
      this.isNavigatingToPage = initialPage;
      this.animationFrameRequestId = requestAnimationFrame(() => {
        // Send command directly; render window already contains destination.
        UIManager.dispatchViewManagerCommand(
          findNodeHandle(this),
          getViewManagerConfig().Commands.setPageWithoutAnimation,
          [initialPage]
        );
      });
    }
  }

  shouldComponentUpdate(
    nextProps: LazyPagerViewImplProps<ItemT>,
    nextState: LazyPagerViewImplState
  ) {
    const stateKeys: (keyof LazyPagerViewImplState)[] = [
      'offset',
      'windowLength',
    ];
    for (const stateKey of stateKeys) {
      if (this.state[stateKey] !== nextState[stateKey]) {
        return true;
      }
    }

    const propKeys: (keyof LazyPagerViewImplProps<ItemT>)[] = [
      'data',
      'keyExtractor',
      'offscreenPageLimit',
      'orientation',
      'overdrag',
      'overScrollMode',
      'pageMargin',
      'renderItem',
      'scrollEnabled',
      'showPageIndicator',
      'transitionStyle',
    ];
    for (const propKey of propKeys) {
      if (this.props[propKey] !== nextProps[propKey]) {
        return true;
      }
    }

    return false;
  }

  /**
   * A helper function to scroll to a specific page in the PagerView.
   */
  setPage(page: number, animated: boolean) {
    if (page < 0 || page >= this.props.data.length) {
      return;
    }

    // Start rendering the destination.
    this.setState((prevState) =>
      this.computeRenderWindow({
        buffer: this.props.buffer,
        currentPage: page,
        maxRenderWindow: this.props.maxRenderWindow,
        offset: prevState.offset,
        windowLength: prevState.windowLength,
      })
    );
    // Send paging command.
    requestAnimationFrame(() => {
      UIManager.dispatchViewManagerCommand(
        findNodeHandle(this),
        animated
          ? getViewManagerConfig().Commands.setPage
          : getViewManagerConfig().Commands.setPageWithoutAnimation,
        [page]
      );
    });
  }

  /**
   * A helper function to enable/disable scroll imperatively.
   * The recommended way is using the scrollEnabled prop, however, there might
   * be a case where an imperative solution is more useful (e.g. for not
   * blocking an animation)
   */
  setScrollEnabled(scrollEnabled: boolean) {
    UIManager.dispatchViewManagerCommand(
      findNodeHandle(this),
      getViewManagerConfig().Commands.setScrollEnabled,
      [scrollEnabled]
    );
  }

  /**
   * Compute desired render window size.
   *
   * Returns `offset` and `windowLength` unmodified, unless in conflict with
   * restrictions from `buffer` or `maxRenderWindow`.
   */
  private computeRenderWindow(data: RenderWindowData): LazyPagerViewImplState {
    const buffer = Math.max(data.buffer ?? 1, 1);
    const maxRenderWindowLowerBound = 1 + 2 * buffer;
    let offset = Math.max(Math.min(data.offset, data.currentPage - buffer), 0);
    let windowLength =
      Math.max(data.offset + data.windowLength, data.currentPage + buffer + 1) -
      offset;

    let maxRenderWindow = data.maxRenderWindow ?? 0;
    if (maxRenderWindow !== 0) {
      if (maxRenderWindow < maxRenderWindowLowerBound) {
        console.warn(
          `maxRenderWindow too small. Increasing to ${maxRenderWindowLowerBound}`
        );
        maxRenderWindow = maxRenderWindowLowerBound;
      }
      if (windowLength > maxRenderWindow) {
        offset = data.currentPage - Math.floor(maxRenderWindow / 2);
        windowLength = maxRenderWindow;
      }
    }

    return { offset, windowLength };
  }

  private onMoveShouldSetResponderCapture = () => this.isScrolling;

  private onPageScroll = (event: PagerViewOnPageScrollEvent) => {
    this.props.onPageScroll?.(event);
    if (this.props.keyboardDismissMode === 'on-drag') {
      Keyboard.dismiss();
    }
  };

  private onPageScrollStateChanged = (
    event: PageScrollStateChangedNativeEvent
  ) => {
    this.props.onPageScrollStateChanged?.(event);
    this.isScrolling = event.nativeEvent.pageScrollState === 'dragging';
  };

  private onPageSelected = (event: PagerViewOnPageSelectedEvent) => {
    const currentPage = event.nativeEvent.position;

    // Ignore spurious events that can occur on mount with `initialPage`.
    // TODO: Is there a way to avoid triggering the events at all?
    if (this.isNavigatingToPage != null) {
      if (this.isNavigatingToPage === currentPage) {
        this.isNavigatingToPage = null;
      } else {
        // Ignore event.
        return;
      }
    }

    this.props.onPageSelected?.(event);

    // Queue renders for next needed pages (if not already available).
    if (this.renderRequestHandle != null) {
      this.renderRequestHandle.cancel();
    }
    this.renderRequestHandle = InteractionManager.runAfterInteractions(() => {
      this.renderRequestHandle = undefined;
      this.setState((prevState) =>
        this.computeRenderWindow({
          buffer: this.props.buffer,
          currentPage,
          maxRenderWindow: this.props.maxRenderWindow,
          offset: prevState.offset,
          windowLength: prevState.windowLength,
        })
      );
    });
  };

  private renderChildren(offset: number, windowLength: number) {
    const keys: string[] = [];
    return {
      children: this.props.data
        .slice(offset, offset + windowLength)
        .map((item, index) => {
          const key = this.props.keyExtractor(item, offset + index);
          keys.push(key);
          return (
            <View collapsable={false} key={key} style={styles.pageContainer}>
              {this.props.renderItem({ item, index: offset + index })}
            </View>
          );
        }),
      keys,
    };
  }

  render() {
    const { offset, windowLength } = this.state;
    const { children } = this.renderChildren(offset, windowLength);

    return (
      <PagerViewViewManager
        count={this.props.data.length}
        offscreenPageLimit={this.props.offscreenPageLimit}
        offset={offset}
        onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
        onPageScroll={this.onPageScroll}
        onPageScrollStateChanged={this.onPageScrollStateChanged}
        onPageSelected={this.onPageSelected}
        orientation={this.props.orientation}
        overdrag={this.props.overdrag}
        overScrollMode={this.props.overScrollMode}
        pageMargin={this.props.pageMargin}
        scrollEnabled={this.props.scrollEnabled}
        showPageIndicator={this.props.showPageIndicator}
        style={styles.nativeView}
        transitionStyle={this.props.transitionStyle}
      >
        {children}
      </PagerViewViewManager>
    );
  }
}

const styles = StyleSheet.create({
  nativeView: { flex: 1 },
  pageContainer: { height: '100%', position: 'absolute', width: '100%' },
});
