import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import PagerView from 'react-native-pager-view';

const PAGES = [
  { key: '1', title: 'Page 1', color: '#ff6b6b' },
  { key: '2', title: 'Page 2', color: '#4ecdc4' },
  { key: '3', title: 'Page 3', color: '#45b7d1' },
  { key: '4', title: 'Page 4', color: '#96ceb4' },
];

export default function BasicExample() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVertical, setIsVertical] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [pageMargin, setPageMargin] = useState(0);
  const [overdrag, setOverdrag] = useState(false);
  const [offscreenLimit, setOffscreenLimit] = useState(0);

  return (
    <View style={styles.container}>
      <PagerView
        key={`${isVertical}-${isRTL}`}
        style={styles.pager}
        initialPage={0}
        orientation={isVertical ? 'vertical' : 'horizontal'}
        layoutDirection={isRTL ? 'rtl' : 'ltr'}
        scrollEnabled={scrollEnabled}
        pageMargin={pageMargin}
        overdrag={overdrag}
        offscreenPageLimit={offscreenLimit}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {PAGES.map((page) => (
          <View
            key={page.key}
            style={[styles.page, { backgroundColor: page.color }]}
          >
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.subtitle}>
              {isVertical ? 'Swipe up/down' : 'Swipe left/right'}
            </Text>
          </View>
        ))}
      </PagerView>
      <View style={styles.indicators}>
        {PAGES.map((page, index) => (
          <View
            key={page.key}
            style={[styles.dot, index === currentPage && styles.activeDot]}
          />
        ))}
      </View>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, isVertical && styles.buttonActive]}
          onPress={() => setIsVertical((v) => !v)}
        >
          <Text style={styles.buttonText}>
            {isVertical ? 'Vertical' : 'Horizontal'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, isRTL && styles.buttonActive]}
          onPress={() => setIsRTL((v) => !v)}
        >
          <Text style={styles.buttonText}>{isRTL ? 'RTL' : 'LTR'}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, !scrollEnabled && styles.buttonDisabled]}
          onPress={() => setScrollEnabled((v) => !v)}
        >
          <Text style={styles.buttonText}>
            Scroll: {scrollEnabled ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, pageMargin > 0 && styles.buttonActive]}
          onPress={() => setPageMargin((m) => (m > 0 ? 0 : 20))}
        >
          <Text style={styles.buttonText}>Margin: {pageMargin}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, overdrag && styles.buttonActive]}
          onPress={() => setOverdrag((v) => !v)}
        >
          <Text style={styles.buttonText}>
            Overdrag: {overdrag ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, offscreenLimit > 0 && styles.buttonActive]}
          onPress={() => setOffscreenLimit((v) => (v > 0 ? 0 : 1))}
        >
          <Text style={styles.buttonText}>
            Offscreen: {offscreenLimit || 'all'}
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
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: '#6200ee' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonActive: { backgroundColor: '#e91e63' },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
