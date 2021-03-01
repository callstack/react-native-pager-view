import React, { useMemo } from 'react';
import { Image, StyleSheet, View, SafeAreaView, Animated } from 'react-native';

import ViewPager from '@react-native-community/viewpager';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';

const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);

export function BasicViewPagerExample() {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedViewPager
        ref={ref}
        style={styles.viewPager}
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
      >
        {useMemo(
          () =>
            navigationPanel.pages.map((page) => (
              <View key={page.key} style={page.style} collapsable={false}>
                <Image style={styles.image} source={page.imgSource} />
                <LikeCount />
              </View>
            )),
          [navigationPanel.pages]
        )}
      </AnimatedViewPager>
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
  viewPager: {
    flex: 1,
  },
});
