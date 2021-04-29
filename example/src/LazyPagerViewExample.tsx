import React from 'react';
import { Image, StyleSheet, View, SafeAreaView, Animated } from 'react-native';

import { LazyPagerView } from 'react-native-pager-view';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import type { CreatePage } from './utils';

const AnimatedPagerView = Animated.createAnimatedComponent(LazyPagerView);

function keyExtractor(page: CreatePage) {
  return `${page.key}`;
}

function renderItem({ item }: { item: CreatePage }) {
  return (
    <View style={item.style}>
      <Image style={styles.image} source={item.imgSource} />
      <LikeCount />
    </View>
  );
}

export function LazyPagerViewExample() {
  const { ref, ...navigationPanel } = useNavigationPanel<
    LazyPagerView<unknown>
  >();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedPagerView
        ref={ref}
        style={styles.PagerView}
        initialPage={0}
        overdrag={navigationPanel.overdragEnabled}
        scrollEnabled={navigationPanel.scrollEnabled}
        onPageScroll={navigationPanel.onPageScroll}
        onPageSelected={navigationPanel.onPageSelected}
        onPageScrollStateChanged={navigationPanel.onPageScrollStateChanged}
        pageMargin={10}
        // Lib does not support dynamically orientation change
        orientation="horizontal"
        // Lib does not support dynamically transitionStyle change
        transitionStyle="scroll"
        showPageIndicator={navigationPanel.dotsEnabled}
        data={navigationPanel.pages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
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
