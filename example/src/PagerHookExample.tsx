import React, { useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';

import { LikeCount } from './component/LikeCount';
import { NavigationPanel } from './component/NavigationPanel';
import { useViewPager } from 'react-native-pager-view';

export function PagerHookExample() {
  const { AnimatedPagerView, ref, ...rest } = useViewPager(10);

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedPagerView
        // @ts-ignore
        testID="pager-view"
        ref={ref}
        style={styles.PagerView}
        initialPage={0}
        layoutDirection="ltr"
        overdrag={rest.overdragEnabled}
        scrollEnabled={rest.scrollEnabled}
        onPageScroll={rest.onPageScroll}
        onPageSelected={rest.onPageSelected}
        onPageScrollStateChanged={rest.onPageScrollStateChanged}
        pageMargin={10}
        // Lib does not support dynamically orientation change
        orientation="horizontal"
      >
        {useMemo(
          () =>
            rest.pages.map((_, index) => (
              <View
                testID="pager-view-content"
                key={index}
                style={{
                  flex: 1,
                  backgroundColor: '#fdc08e',
                  alignItems: 'center',
                  padding: 20,
                }}
                collapsable={false}
              >
                <LikeCount />
                <Text
                  testID={`pageNumber${index}`}
                >{`page number ${index}`}</Text>
              </View>
            )),
          [rest.pages]
        )}
      </AnimatedPagerView>
      <NavigationPanel {...rest} />
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
