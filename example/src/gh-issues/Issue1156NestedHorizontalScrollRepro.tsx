/**
 * Repro for #1156: on Android, a horizontal ScrollView inside a page must
 * scroll when swiped, and the pager must only take over once the ScrollView
 * has reached its edge. Swipe left on the chip row: the chips should scroll
 * and the selected page should stay at 0.
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

const chips = Array.from({ length: 12 }, (_, index) => `Chip ${index + 1}`);

export function Issue1156NestedHorizontalScrollRepro() {
  const chipsRef = useRef<ScrollViewInstance>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [chipsScrolled, setChipsScrolled] = useState(false);

  return (
    <View style={styles.container}>
      <Text testID="issue-1156-status" style={styles.status}>
        {`Selected: ${selectedPage} | Chips scrolled: ${
          chipsScrolled ? 'yes' : 'no'
        }`}
      </Text>
      <Button
        testID="issue-1156-scroll-to-end"
        title="Scroll chips to end"
        onPress={() => chipsRef.current?.scrollToEnd({ animated: false })}
      />
      <PagerView
        testID="issue-1156-pager"
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setSelectedPage(e.nativeEvent.position)}
      >
        <View key="1" style={styles.page}>
          <ScrollView
            ref={chipsRef}
            testID="issue-1156-chips"
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chips}
            scrollEventThrottle={16}
            onScroll={(e) =>
              setChipsScrolled(e.nativeEvent.contentOffset.x > 0)
            }
          >
            {chips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text>{chip}</Text>
              </View>
            ))}
          </ScrollView>
          <Text testID="issue-1156-page-0" style={styles.label}>
            Page 1: swipe here to change page
          </Text>
        </View>
        <View key="2" style={styles.page}>
          <Text testID="issue-1156-page-1" style={styles.label}>
            Page 2
          </Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  status: { padding: 16, fontSize: 16 },
  pager: { flex: 1 },
  page: { flex: 1, paddingTop: 80 },
  chips: { flexGrow: 0 },
  chip: { padding: 16, margin: 4, backgroundColor: '#ddd' },
  label: { padding: 16, marginTop: 80 },
});
