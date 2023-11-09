import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Animated, Text } from 'react-native';

import PagerView from 'react-native-pager-view';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

function Cell({ page, index }) {
  React.useEffect(() => {
    console.log(`🚀🚀🚀🚀🚀🚀🚀🚀 ${page.key}`);
  }, []);

  return (
    <>
      <LikeCount />
      <Text testID={`pageNumber${index}`}>{`page number ${index}`}</Text>
    </>
  );
}
export function BasicPagerViewExample() {
  const { ref, ...navigationPanel } = useNavigationPanel(2);

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedPagerView
        // @ts-ignore
        testID="pager-view"
        ref={ref}
        style={styles.PagerView}
        initialPage={0}
        layoutDirection="ltr"
        overdrag={navigationPanel.overdragEnabled}
        scrollEnabled={navigationPanel.scrollEnabled}
        onPageScroll={navigationPanel.onPageScroll}
        onPageSelected={navigationPanel.onPageSelected}
        onPageScrollStateChanged={navigationPanel.onPageScrollStateChanged}
        pageMargin={10}
        // Lib does not support dynamically orientation change
        orientation="horizontal"
      >
        {useMemo(
          () =>
            navigationPanel.pages.map((page, index) => {
              return (
                <View
                  testID="pager-view-content"
                  key={page.key}
                  style={page.style}
                  collapsable={false}
                >
                  <Cell page={page} index={index} />
                </View>
              );
            }),
          [navigationPanel.pages]
        )}
      </AnimatedPagerView>
      <NavigationPanel {...navigationPanel} />
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
});
