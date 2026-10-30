/**
 * Repro for #1205: on Android, a mostly vertical drag with a small sideways
 * component on a vertical ScrollView inside a page must keep scrolling the
 * ScrollView. Drag diagonally on the list: "Scroll Y" should grow and the
 * pager should stay on page 0 without leaving the idle state.
 */
import React, { useRef, useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const rows = Array.from({ length: 60 }, (_, index) => `Row ${index + 1}`);

export function Issue1205DiagonalSwipeRepro() {
  const listRef = useRef<ScrollViewInstance>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [pagerStates, setPagerStates] = useState<string[]>([]);

  return (
    <View style={styles.container}>
      <Text testID="issue-1205-status" style={styles.status}>
        {`Selected: ${selectedPage} | Scroll Y: ${Math.round(scrollY)}`}
      </Text>
      <Text testID="issue-1205-states" style={styles.states}>
        {`Pager states: ${pagerStates.join(' > ') || '-'}`}
      </Text>
      <Button
        testID="issue-1205-reset"
        title="Reset"
        onPress={() => {
          listRef.current?.scrollTo({ y: 0, animated: false });
          setScrollY(0);
          setPagerStates([]);
        }}
      />
      <PagerView
        testID="issue-1205-pager"
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setSelectedPage(e.nativeEvent.position)}
        onPageScrollStateChanged={(e) => {
          const state = e.nativeEvent.pageScrollState;
          setPagerStates((states) => [...states, state].slice(-6));
        }}
      >
        <View key="1" style={styles.page}>
          <ScrollView
            ref={listRef}
            testID="issue-1205-list"
            scrollEventThrottle={16}
            onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          >
            {rows.map((row) => (
              <View key={row} style={styles.row}>
                <Text>{row}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View key="2" style={styles.page}>
          <Text testID="issue-1205-page-1" style={styles.label}>
            Page 2
          </Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  status: { paddingHorizontal: 16, paddingTop: 16, fontSize: 16 },
  states: { paddingHorizontal: 16, paddingBottom: 8, fontSize: 14 },
  pager: { flex: 1 },
  page: { flex: 1 },
  row: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  label: { padding: 16, fontSize: 16 },
});
