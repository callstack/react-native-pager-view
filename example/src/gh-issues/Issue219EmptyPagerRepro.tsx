/**
 * Repro for #219 on Android: a pager that mounts with no pages, or loses all
 * of them, must show its first page as soon as pages arrive, without a touch.
 */
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

const PAGES = ['A', 'B', 'C', 'D'];
const COLORS: Record<string, string> = {
  A: '#fca5a5',
  B: '#86efac',
  C: '#93c5fd',
  D: '#fde68a',
};

export function Issue219EmptyPagerRepro() {
  const pagerRef = useRef<PagerViewRef>(null);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [events, setEvents] = useState(0);

  return (
    <View style={styles.screen}>
      <Text testID="issue-219-status" style={styles.status}>
        {`Pages: ${count} | Selected: ${selected ?? '-'} | Events: ${events}`}
      </Text>
      <Button
        testID="issue-219-add-pages"
        title="Add pages"
        onPress={() => setCount(PAGES.length)}
      />
      <Button
        testID="issue-219-remove-pages"
        title="Remove pages"
        onPress={() => setCount(0)}
      />
      <Button
        testID="issue-219-select-c"
        title="Select C"
        onPress={() => pagerRef.current?.setPageWithoutAnimation(2)}
      />
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => {
          setSelected(e.nativeEvent.position);
          setEvents((value) => value + 1);
        }}
      >
        {PAGES.slice(0, count).map((page) => (
          <View
            key={page}
            style={[styles.page, { backgroundColor: COLORS[page] }]}
          >
            <Text style={styles.label}>{`Page ${page}`}</Text>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  status: { padding: 12, fontSize: 16 },
  pager: { flex: 1 },
  page: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 32, fontWeight: 'bold' },
});
