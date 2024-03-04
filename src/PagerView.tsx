import React from 'react';
import { Platform, Keyboard } from 'react-native';
import { I18nManager } from 'react-native';
import type {
  OnPageScrollEventData,
  OnPageScrollStateChangedEventData,
  OnPageSelectedEventData,
} from './PagerViewNativeComponent';
import type * as ReactNative from 'react-native';

import type { NativeProps as PagerViewProps } from './PagerViewNativeComponent';
import { childrenWithOverriddenStyle } from './utils';
import PagerViewView, {
  Commands as PagerViewCommands,
} from './PagerViewNativeComponent';

// The Fabric component for PagerView uses a work around present also in ScrollView:
// https://github.com/callstack/react-native-pager-view/blob/master/ios/Fabric/RNCPagerViewComponentView.mm#L362-L368
// That workaround works only if we add these lines in to make sure that the RCTEventEmitter is registered properly
// in the JS callable modules.
// NOTE: This is a workaround as we would like to get rid of these lines below. But for the time being, as the cut date for
// 0.74 approaches, we need to keep these lines.
// As soon as we figure out how to move forward, we will provide guidance and/or submit a PR to fix this.
if (Platform.OS === 'ios') {
  require('react-native/Libraries/Renderer/shims/ReactNative'); // Force side effects to prevent T55744311
}

/**
 * Container that allows to flip left and right between child views. Each
 * child view of the `PagerView` will be treated as a separate page
 * and will be stretched to fill the `PagerView`.
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
 *     <PagerView
 *       style={styles.PagerView}
 *       initialPage={0}>
 *       <View style={styles.pageStyle} key="1">
 *         <Text>First page</Text>
 *       </View>
 *       <View style={styles.pageStyle} key="2">
 *         <Text>Second page</Text>
 *       </View>
 *     </PagerView>
 *   );
 * }
 *
 * ...
 *
 * var styles = {
 *   ...
 *   PagerView: {
 *     flex: 1
 *   },
 *   pageStyle: {
 *     alignItems: 'center',
 *     padding: 20,
 *   }
 * }
 * ```
 */

export class PagerView extends React.Component<PagerViewProps> {
  private isScrolling = false;
  pagerView: React.ElementRef<typeof PagerViewView> | null = null;

  private _onPageScroll = (
    e: ReactNative.NativeSyntheticEvent<OnPageScrollEventData>
  ) => {
    if (this.props.onPageScroll) {
      this.props.onPageScroll(e);
    }

    // Not implemented on iOS yet
    if (Platform.OS === 'android') {
      if (this.props.keyboardDismissMode === 'on-drag') {
        Keyboard.dismiss();
      }
    }
  };

  private _onPageScrollStateChanged = (
    e: ReactNative.NativeSyntheticEvent<OnPageScrollStateChangedEventData>
  ) => {
    if (this.props.onPageScrollStateChanged) {
      this.props.onPageScrollStateChanged(e);
    }
    this.isScrolling = e.nativeEvent.pageScrollState === 'dragging';
  };

  private _onPageSelected = (
    e: ReactNative.NativeSyntheticEvent<OnPageSelectedEventData>
  ) => {
    if (this.props.onPageSelected) {
      this.props.onPageSelected(e);
    }
  };

  /**
   * A helper function to scroll to a specific page in the PagerView.
   * The transition between pages will be animated.
   */
  public setPage = (selectedPage: number) => {
    if (this.pagerView) {
      PagerViewCommands.setPage(this.pagerView, selectedPage);
    }
  };

  /**
   * A helper function to scroll to a specific page in the PagerView.
   * The transition between pages will *not* be animated.
   */
  public setPageWithoutAnimation = (selectedPage: number) => {
    if (this.pagerView) {
      PagerViewCommands.setPageWithoutAnimation(this.pagerView, selectedPage);
    }
  };

  /**
   * A helper function to enable/disable scroll imperatively
   * The recommended way is using the scrollEnabled prop, however, there might be a case where a
   * imperative solution is more useful (e.g. for not blocking an animation)
   */
  public setScrollEnabled = (scrollEnabled: boolean) => {
    if (this.pagerView) {
      PagerViewCommands.setScrollEnabledImperatively(
        this.pagerView,
        scrollEnabled
      );
    }
  };

  private _onMoveShouldSetResponderCapture = () => {
    return this.isScrolling;
  };

  private get deducedLayoutDirection() {
    if (
      !this.props.layoutDirection ||
      //@ts-ignore fix it
      this.props.layoutDirection === 'locale'
    ) {
      return I18nManager.isRTL ? 'rtl' : 'ltr';
    } else {
      return this.props.layoutDirection;
    }
  }

  render() {
    return (
      <PagerViewView
        {...this.props}
        ref={(ref) => {
          this.pagerView = ref;
        }}
        style={this.props.style}
        layoutDirection={this.deducedLayoutDirection}
        onPageScroll={this._onPageScroll}
        onPageScrollStateChanged={this._onPageScrollStateChanged}
        onPageSelected={this._onPageSelected}
        onMoveShouldSetResponderCapture={this._onMoveShouldSetResponderCapture}
        children={childrenWithOverriddenStyle(this.props.children)}
      />
    );
  }
}
