import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import PagerView from 'react-native-pager-view';

const PAGES = [
  { key: '1', title: 'Page 1', color: '#ff6b6b' },
  { key: '2', title: 'Page 2', color: '#4ecdc4' },
  { key: '3', title: 'Page 3', color: '#45b7d1' },
];

export default function ImperativeExample() {
  const pagerRef = useRef<PagerView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={scrollEnabled}
      >
        {PAGES.map((page) => (
          <View
            key={page.key}
            style={[styles.page, { backgroundColor: page.color }]}
          >
            <Text style={styles.title}>{page.title}</Text>
          </View>
        ))}
      </PagerView>
      <View style={styles.controls}>
        {PAGES.map((page, index) => (
          <Pressable
            key={page.key}
            style={styles.button}
            onPress={() => pagerRef.current?.setPage(index)}
          >
            <Text style={styles.buttonText}>Go to {index}</Text>
          </Pressable>
        ))}
        <Pressable
          style={styles.button}
          onPress={() => pagerRef.current?.setPageWithoutAnimation(0)}
        >
          <Text style={styles.buttonText}>Jump to 0 (no animation)</Text>
        </Pressable>
        <Pressable
          style={[styles.button, !scrollEnabled && styles.buttonDisabled]}
          onPress={() => {
            const next = !scrollEnabled;
            setScrollEnabled(next);
            pagerRef.current?.setScrollEnabled(next);
          }}
        >
          <Text style={styles.buttonText}>
            Scroll: {scrollEnabled ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
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
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
