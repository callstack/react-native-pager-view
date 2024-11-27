import React, { useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Animated, Text } from 'react-native';

import PagerView from 'react-native-pager-view';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export function BasicPagerViewExample() {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedPagerView
        {...navigationPanel}
        testID="pager-view"
        ref={ref}
        style={styles.PagerView}
        initialPage={0}
        pageMargin={10}
      >
        {useMemo(
          () =>
            navigationPanel.pages.map((page, index) => (
              <View
                testID="pager-view-content"
                key={page.key}
                style={page.style}
                collapsable={false}
              >
                <LikeCount />
                <Text
                  testID={`pageNumber${index}`}
                >{`page number ${index}`}</Text>
              </View>
            )),
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
