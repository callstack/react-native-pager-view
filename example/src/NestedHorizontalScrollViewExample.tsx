import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Animated,
  Text,
  ScrollView,
} from 'react-native';

import PagerView from 'react-native-pager-view';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

/**
 * When dragging the horizontal ScrollView inside the PagerView, it can slightly push pager view into a different page.
 * This is because scrollview in the same direction overdrags the outer scrollview (pager view).
 * This example reproduces this behavior.
 * Go to the second page and try to drag the horizontal scrollview.
 */
export function NestedHorizontalScrollViewExample() {
  const { ref, ...navigationPanel } = useNavigationPanel(3);

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
            navigationPanel.pages.map((page, index) => {
              if (index === 1) {
                return (
                  <ScrollView
                    horizontal
                    key={page.key}
                    contentContainerStyle={{ margin: 20 }}
                  >
                    <View
                      style={[styles.box, { backgroundColor: 'lightblue' }]}
                    >
                      <Text
                        testID={`pageNumber${index}`}
                      >{`Scroll View page number ${index}`}</Text>
                    </View>
                    <View style={styles.box}>
                      <Text
                        testID={`pageNumber${index}`}
                      >{`Scroll View page number ${index}`}</Text>
                    </View>
                  </ScrollView>
                );
              }

              return (
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
  box: {
    width: 300,
    height: '100%',
    backgroundColor: 'lightgreen',
    padding: 20,
  },
});
