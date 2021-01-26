import React from 'react';
import { Image, StyleSheet, View, SafeAreaView, Animated } from 'react-native';

import ViewPager from '@react-native-community/viewpager';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import type { CreatePage } from './utils';

class CreatePageViewPager extends ViewPager<CreatePage> {}
const AnimatedViewPager = Animated.createAnimatedComponent(CreatePageViewPager);

export function BasicViewPagerExample() {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedViewPager
        style={styles.viewPager}
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
