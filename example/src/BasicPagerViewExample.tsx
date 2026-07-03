import React, { useMemo } from 'react';
import { StyleSheet, SafeAreaView, Animated } from 'react-native';

import PagerView from 'react-native-pager-view';

import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import { PagerViewContent } from './component/PagerViewContent';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

type BasicPagerViewExampleProps = {
  isHorizontal: boolean;
};

export function BasicPagerViewExample({
  isHorizontal,
}: BasicPagerViewExampleProps) {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedPagerView
        {...navigationPanel}
        testID="pager-view"
        ref={ref}
        style={styles.PagerView}
        initialPage={0}
        orientation={isHorizontal ? 'horizontal' : 'vertical'}
        pageMargin={10}
      >
        {useMemo(
          () =>
            navigationPanel.pages.map((page, index) => (
              <PagerViewContent
                key={page.key}
                style={page.style}
                index={index}
              />
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
