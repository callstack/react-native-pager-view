import React, { useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Image } from 'react-native';

import PagerView from 'react-native-pager-view';

import { LikeCount } from './component/LikeCount';
import { createPage } from './utils';

const pages = [createPage(0), createPage(1), createPage(2)];

export function BasicPagerViewExample() {
  function renderPage(page: any) {
    return (
      <View key={page.key} style={page.style} collapsable={false}>
        <Image style={styles.image} source={page.imgSource} />
        <LikeCount />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <PagerView
        //@ts-ignore
        testID="pager-view"
        style={styles.PagerView}
        initialPage={0}
        layoutDirection="ltr"
        pageMargin={10}
        // Lib does not support dynamically orientation change
        orientation="horizontal"
        showPageIndicator={false}
      >
        {pages.map((p) => renderPage(p))}
      </PagerView>
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
