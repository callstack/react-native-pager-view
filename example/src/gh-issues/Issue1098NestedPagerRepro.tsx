import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

/**
 * Reproduces https://github.com/callstack/react-native-pager-view/issues/1098
 *
 * iOS only. The action changes the outer pager's child count, which rebuilds
 * its SwiftUI TabView while the nested pagers' native views are retained. In
 * affected builds this leaves an inner hosting controller parented to a stale
 * PageChildViewController and UIKit later terminates with
 * UIViewControllerHierarchyInconsistency.
 */
export function Issue1098NestedPagerRepro() {
  const [hasExtraOuterPage, setHasExtraOuterPage] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshOuterPager = () => {
    setHasExtraOuterPage((value) => !value);
    setRefreshCount((count) => count + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Text style={styles.heading}>Issue #1098: nested pagers</Text>
        <Text style={styles.description}>
          Tap “Refresh outer pages”, then swipe between the outer pages. Repeat
          a few times. On affected iOS builds, this eventually crashes with
          UIViewControllerHierarchyInconsistency.
        </Text>
        <Button
          title="Refresh outer pages"
          testID="issue-1098-refresh-outer-pages"
          onPress={refreshOuterPager}
        />
        <Text style={styles.counter}>Refreshes: {refreshCount}</Text>
      </View>

      <PagerView
        initialPage={0}
        style={styles.outerPager}
        testID="issue-1098-outer-pager"
      >
        {[
          <View key="nested-page" collapsable={false} style={styles.outerPage}>
            <Text style={styles.pageTitle}>Outer page: nested pagers</Text>
            <PagerView
              initialPage={0}
              style={styles.innerPager}
              testID="issue-1098-inner-pager"
            >
              <InnerPage color="#ffb3ba" label="Inner page 1" />
              <InnerPage color="#bae1ff" label="Inner page 2" />
            </PagerView>
          </View>,
          <View key="second-page" collapsable={false} style={styles.secondPage}>
            <Text style={styles.pageTitle}>Outer page 2</Text>
            <Text>Swipe back to the nested page after each refresh.</Text>
          </View>,
          ...(hasExtraOuterPage
            ? [
                <View
                  key="extra-page"
                  collapsable={false}
                  style={styles.extraPage}
                >
                  <Text style={styles.pageTitle}>Conditional outer page</Text>
                  <Text>
                    Its insertion/removal forces the outer SwiftUI TabView to
                    rebuild.
                  </Text>
                </View>,
              ]
            : []),
        ]}
      </PagerView>
    </View>
  );
}

function InnerPage({ color, label }: { color: string; label: string }) {
  return (
    <View
      collapsable={false}
      style={[styles.innerPage, { backgroundColor: color }]}
    >
      <Text style={styles.pageTitle}>{label}</Text>
      <Text>Swipe horizontally inside this nested PagerView.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    padding: 16,
    gap: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    color: '#444',
    lineHeight: 20,
  },
  counter: {
    color: '#555',
  },
  outerPager: {
    flex: 1,
  },
  outerPage: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  secondPage: {
    flex: 1,
    padding: 16,
    backgroundColor: '#d7f9e9',
  },
  extraPage: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff2cc',
  },
  innerPager: {
    flex: 1,
    marginTop: 16,
  },
  innerPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
