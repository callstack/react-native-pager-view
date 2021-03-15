import React from 'react';
import { Image, StyleSheet, View, SafeAreaView } from 'react-native';
import ViewPager from '@react-native-community/viewpager';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import { CreatePage, createPageKeyExtractor } from './utils';

function renderItem({ item }: { item: CreatePage }) {
  return (
    <View style={item.style}>
      <Image style={styles.image} source={item.imgSource} />
      <LikeCount />
    </View>
  );
}

export function BasicViewPagerExample() {
  const { ref, ...navigationPanel } = useNavigationPanel<CreatePage>();

  return (
    <SafeAreaView style={styles.container}>
      <ViewPager
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
        showPageIndicator={navigationPanel.dotsEnabled}
        data={navigationPanel.pages}
        keyExtractor={createPageKeyExtractor}
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
  viewPager: {
    flex: 1,
  },
});
