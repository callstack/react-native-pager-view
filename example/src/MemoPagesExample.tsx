// The selected page lives in state, so every page change re-renders the pager.
// Memoized pages must still render only once.
import React, { memo, useRef, useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];

const MemoPage = memo(function Page({
  index,
  style,
}: {
  index: number;
  style?: StyleProp<ViewStyle>;
}) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <View
      testID={`memo-pages-page-${index}`}
      style={[style, { backgroundColor: PAGE_COLORS[index] }]}
    >
      <Text style={styles.label}>{PAGES[index]}</Text>
      <Text testID={`memo-pages-renders-${index}`} style={styles.renders}>
        renders: {renders.current}
      </Text>
    </View>
  );
});

export function MemoPagesExample() {
  const pagerRef = useRef<PagerViewRef>(null);
  const [page, setPage] = useState(0);
  const [ticks, setTicks] = useState(0);

  return (
    <View style={styles.screen}>
      <Text testID="memo-pages-status" style={styles.status}>
        Page: {page} | Re-renders: {ticks}
      </Text>
      <View style={styles.buttons}>
        <Button
          testID="memo-pages-rerender"
          title="Re-render parent"
          onPress={() => setTicks((count) => count + 1)}
        />
        <Button
          testID="memo-pages-next"
          title="Next page"
          onPress={() => pagerRef.current?.setPage(page + 1)}
        />
      </View>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(event) => setPage(event.nativeEvent.position)}
      >
        {PAGES.map((label, index) => (
          <MemoPage key={label} index={index} style={styles.page} />
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  status: { padding: 16, fontSize: 14, color: '#444' },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  pager: { flex: 1 },
  page: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  label: { fontSize: 32, fontWeight: '600' },
  renders: { fontSize: 18 },
});
