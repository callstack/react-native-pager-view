/**
 * Repro for #1248: on Android, an upward drag that starts over a height-clipped
 * multiline Text inside a vertical ScrollView in a page must scroll the
 * ScrollView. Selectable text gets a movement method, which makes the native
 * TextView report a vertical scroll range.
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const preview = Array.from(
  { length: 30 },
  (_, index) => `Preview line ${index + 1}`
).join('\n');

export function Issue1248ClippedTextScrollRepro() {
  const [scrollY, setScrollY] = useState(0);
  const [innerScrollY, setInnerScrollY] = useState(0);

  return (
    <View style={styles.container}>
      <Text testID="issue-1248-status" style={styles.status}>
        {`Scroll Y: ${Math.round(scrollY)}`}
      </Text>
      <Text testID="issue-1248-inner-status" style={styles.status}>
        {`Inner Y: ${Math.round(innerScrollY)}`}
      </Text>
      <PagerView style={styles.pager} initialPage={0}>
        <View key="1" style={styles.page}>
          <ScrollView
            testID="issue-1248-list"
            scrollEventThrottle={16}
            onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          >
            <Text selectable style={styles.preview} testID="issue-1248-preview">
              {preview}
            </Text>
            <View style={styles.filler}>
              <Text>End of list</Text>
            </View>
          </ScrollView>
        </View>
        <View key="2" style={styles.page}>
          <ScrollView testID="issue-1248-outer-list">
            <ScrollView
              nestedScrollEnabled
              testID="issue-1248-inner-list"
              style={styles.inner}
              scrollEventThrottle={16}
              onScroll={(e) => setInnerScrollY(e.nativeEvent.contentOffset.y)}
            >
              <View style={styles.innerContent}>
                <Text>Nested list</Text>
              </View>
            </ScrollView>
            <View style={styles.filler}>
              <Text>End of list</Text>
            </View>
          </ScrollView>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  status: { padding: 16, fontSize: 16 },
  pager: { flex: 1 },
  page: { flex: 1 },
  preview: { height: 120, overflow: 'hidden', padding: 8 },
  filler: { height: 1500, padding: 16 },
  inner: { height: 200 },
  innerContent: { height: 1000, padding: 16 },
});
