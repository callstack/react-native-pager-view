import React, { useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Animated } from 'react-native';

import PagerView from 'react-native-pager-view';

import { LikeCount } from './component/LikeCount';
import { BGCOLOR } from './utils';
import { useNavigationPanel } from './hook/useNavigationPanel';
import { PagerViewContent } from './component/PagerViewContent';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export function NestedPagerView() {
  const { ...navigationPanel } = useNavigationPanel();
  return (
    <SafeAreaView testID="safe-area-view" style={styles.container}>
      <AnimatedPagerView
        style={styles.PagerView}
        testID="pager-view"
        initialPage={0}
        layoutDirection="ltr"
        pageMargin={10}
        orientation="horizontal"
      >
        <View
          testID="1-st-page"
          key="1"
          style={{ backgroundColor: BGCOLOR[0] }}
          collapsable={false}
        >
          <LikeCount />
        </View>
        <View key="2" testID="2-nd-nested" collapsable={false}>
          <AnimatedPagerView style={styles.PagerView} initialPage={0}>
            {useMemo(
              () =>
                navigationPanel.pages
                  .slice(1, 3)
                  .map((page, index) => (
                    <PagerViewContent
                      prefix="Horizontal "
                      key={page.key}
                      style={page.style}
                      index={index}
                    />
                  )),
              [navigationPanel.pages]
            )}
          </AnimatedPagerView>
          <AnimatedPagerView
            style={styles.PagerView}
            initialPage={0}
            orientation="vertical"
          >
            {useMemo(
              () =>
                navigationPanel.pages
                  .slice(3, 5)
                  .map((page, index) => (
                    <PagerViewContent
                      prefix="Vertical "
                      key={page.key}
                      style={page.style}
                      index={index}
                    />
                  )),
              [navigationPanel.pages]
            )}
          </AnimatedPagerView>
        </View>
        <View
          testID="3-rd-pager-view"
          key="3"
          style={{ backgroundColor: BGCOLOR[3] }}
          collapsable={false}
        >
          <LikeCount />
        </View>
      </AnimatedPagerView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    width: 300,
    height: 200,
    padding: 20,
  },
  PagerView: {
    flex: 1,
  },
  title: { fontSize: 22, paddingVertical: 10 },
});
