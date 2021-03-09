import React from 'react';
import { Image, StyleSheet, View, SafeAreaView } from 'react-native';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import { AnimatedViewPager } from './utils';

export function BasicViewPagerExample() {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedViewPager
        ref={ref}
        style={styles.viewPager}
        scrollEnabled={navigationPanel.scrollEnabled}
        onPageScroll={navigationPanel.onPageScroll}
        onPageSelected={navigationPanel.onPageSelected}
        onPageScrollStateChanged={navigationPanel.onPageScrollStateChanged}
        pageMargin={10}
        orientation="horizontal"
        overdrag={navigationPanel.overdragEnabled}
        transitionStyle="scroll"
        data={navigationPanel.pages}
        keyExtractor={(page) => `${page.key}`}
        renderItem={({ item }) => (
          <View style={item.style}>
            <Image style={styles.image} source={item.imgSource} />
            <LikeCount />
          </View>
        )}
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
  viewPager: {
    flex: 1,
  },
});
