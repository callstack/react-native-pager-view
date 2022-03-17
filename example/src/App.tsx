import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import PagerView from 'react-native-pager-view';

import { LikeCount } from './component/LikeCount';
import { useNavigationPanel } from './hook/useNavigationPanel';

export function BasicPagerViewExample() {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <View style={styles.container}>
      <PagerView
        //@ts-ignore
        testID="pager-view"
        ref={ref}
        style={styles.PagerView}
        initialPage={0}
        layoutDirection="ltr"
        overdrag={false}
        scrollEnabled={true}
        pageMargin={0}
        // Lib does not support dynamically orientation change
        orientation="horizontal"
      >
        {useMemo(
          () =>
            navigationPanel.pages.map((page, index) => (
              <View key={page.key} style={page.style} collapsable={false}>
                <LikeCount />
                <Text
                  testID={`pageNumber${index}`}
                >{`page number ${index}`}</Text>
              </View>
            )),
          [navigationPanel.pages]
        )}
      </PagerView>
    </View>
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
