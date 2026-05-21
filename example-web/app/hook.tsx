import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePagerView } from 'react-native-pager-view';

const PAGES = [
  { key: '1', title: 'Page 1', color: '#ff6b6b' },
  { key: '2', title: 'Page 2', color: '#4ecdc4' },
  { key: '3', title: 'Page 3', color: '#45b7d1' },
];

export default function HookExample() {
  const {
    AnimatedPagerView,
    ref,
    activePage,
    onPageScroll,
    onPageSelected,
    onPageScrollStateChanged,
    scrollState,
    progress,
  } = usePagerView({ pagesAmount: PAGES.length });

  return (
    <View style={styles.container}>
      <AnimatedPagerView
        ref={ref}
        style={styles.pager}
        initialPage={0}
        onPageScroll={onPageScroll}
        onPageSelected={onPageSelected}
        onPageScrollStateChanged={onPageScrollStateChanged}
      >
        {PAGES.map((page) => (
          <View
            key={page.key}
            style={[styles.page, { backgroundColor: page.color }]}
          >
            <Text style={styles.title}>{page.title}</Text>
          </View>
        ))}
      </AnimatedPagerView>
      <View style={styles.info}>
        <Text style={styles.label}>usePagerView state:</Text>
        <Text style={styles.value}>
          activePage: {activePage} | scrollState: {scrollState}
        </Text>
        <Text style={styles.value}>
          progress: pos={progress.position} off={progress.offset.toFixed(4)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pager: { flex: 1 },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  info: {
    padding: 16,
    backgroundColor: '#1a1a2e',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    fontFamily: 'monospace',
  },
  value: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
