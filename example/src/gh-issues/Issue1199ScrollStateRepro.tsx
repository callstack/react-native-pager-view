/**
 * Repro for #1199 on Android: a swipe must report `settling` when the finger
 * lifts and `idle` only once the page has stopped. Before the fix the pager
 * reported `idle` as the finger lifted, while the page was still moving, and
 * never `settling`. The status lists the states since the previous `idle` and
 * whether the last `onPageScroll` offset was 0 when `idle` arrived.
 */
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2'];

export function Issue1199ScrollStateRepro() {
  const pager = useRef<PagerViewRef>(null);
  const states = useRef<string[]>([]);
  const offset = useRef(0);
  const [status, setStatus] = useState('No scroll yet');

  return (
    <View style={styles.screen}>
      <Text testID="issue-1199-status" style={styles.status}>
        {status}
      </Text>
      <Button
        testID="issue-1199-next"
        title="setPage(1)"
        onPress={() => pager.current?.setPage(1)}
      />
      <PagerView
        ref={pager}
        style={styles.pager}
        onPageScroll={(e) => {
          offset.current = e.nativeEvent.offset;
        }}
        onPageScrollStateChanged={(e) => {
          const state = e.nativeEvent.pageScrollState;
          states.current.push(state);
          if (state === 'idle') {
            const atRest = offset.current === 0 ? 'yes' : 'no';
            setStatus(
              `${states.current.join(' > ')} | idle at rest: ${atRest}`
            );
            states.current = [];
          }
        }}
      >
        {PAGES.map((label, i) => (
          <View key={label} testID={`issue-1199-page-${i}`} style={styles.page}>
            <Text style={styles.label}>{label}</Text>
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
  label: { fontSize: 24 },
});
