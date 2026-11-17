/**
 * Repro for #1250 on Android: `onPageSelected` must arrive as a swipe or
 * setPage starts moving to its page, as ViewPager2 reported it in v8, not once
 * the page has stopped. A material top tab bar scrolls to the selected tab only
 * on `onPageSelected`, so it lagged behind the page. The status lists the
 * events since the previous `idle` and whether the page still moved after
 * `onPageSelected`.
 */
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2'];

export function Issue1250PageSelectedTimingRepro() {
  const pager = useRef<PagerViewRef>(null);
  const events = useRef<string[]>([]);
  const wasSelected = useRef(false);
  const movedAfterSelected = useRef(false);
  const [status, setStatus] = useState('No scroll yet');

  return (
    <View style={styles.screen}>
      <Text testID="issue-1250-status" style={styles.status}>
        {status}
      </Text>
      <Button
        testID="issue-1250-next"
        title="setPage(2)"
        onPress={() => pager.current?.setPage(2)}
      />
      <PagerView
        ref={pager}
        style={styles.pager}
        onPageSelected={(e) => {
          // Skips the initial page, which is reported before any scroll.
          if (events.current.length === 0) {
            return;
          }
          events.current.push(`selected ${e.nativeEvent.position}`);
          wasSelected.current = true;
          movedAfterSelected.current = false;
        }}
        onPageScroll={(e) => {
          if (wasSelected.current && e.nativeEvent.offset !== 0) {
            movedAfterSelected.current = true;
          }
        }}
        onPageScrollStateChanged={(e) => {
          const state = e.nativeEvent.pageScrollState;
          events.current.push(state);
          if (state === 'idle') {
            const moved = movedAfterSelected.current ? 'yes' : 'no';
            setStatus(
              `${events.current.join(' > ')} | moved after selected: ${moved}`
            );
            events.current = [];
            wasSelected.current = false;
          }
        }}
      >
        {PAGES.map((label, i) => (
          <View key={label} testID={`issue-1250-page-${i}`} style={styles.page}>
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
