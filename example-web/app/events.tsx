import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const PAGES = [
  { key: '1', title: 'Page 1', color: '#ff6b6b' },
  { key: '2', title: 'Page 2', color: '#4ecdc4' },
  { key: '3', title: 'Page 3', color: '#45b7d1' },
];

export default function EventsExample() {
  const [scrollState, setScrollState] = useState('idle');
  const [selectedPage, setSelectedPage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState({
    position: 0,
    offset: 0,
  });

  return (
    <View style={styles.container}>
      <PagerView
        style={styles.pager}
        initialPage={0}
        onPageScroll={(e) =>
          setScrollProgress({
            position: e.nativeEvent.position,
            offset: e.nativeEvent.offset,
          })
        }
        onPageSelected={(e) => setSelectedPage(e.nativeEvent.position)}
        onPageScrollStateChanged={(e) =>
          setScrollState(e.nativeEvent.pageScrollState)
        }
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
      <View style={styles.events}>
        <Text style={styles.label}>onPageScroll</Text>
        <Text style={styles.value}>
          position: {scrollProgress.position} | offset:{' '}
          {scrollProgress.offset.toFixed(4)}
        </Text>

        <Text style={styles.label}>onPageSelected</Text>
        <Text style={styles.value}>position: {selectedPage}</Text>

        <Text style={styles.label}>onPageScrollStateChanged</Text>
        <Text
          style={[
            styles.value,
            scrollState === 'dragging' && styles.dragging,
            scrollState === 'settling' && styles.settling,
          ]}
        >
          {scrollState}
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
  events: {
    padding: 16,
    backgroundColor: '#1a1a2e',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'monospace',
  },
  dragging: { color: '#ff6b6b' },
  settling: { color: '#ffd93d' },
});
