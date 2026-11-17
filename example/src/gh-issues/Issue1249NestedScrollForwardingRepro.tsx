/**
 * Repro for #1249 on Android: a vertical list with a RefreshControl inside a
 * page must forward its nested scroll to a native parent outside the pager, as
 * a collapsing header does. Scroll the list down (drag your finger up): the header should collapse
 * first, then the list should keep scrolling.
 */
import React, { useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  requireNativeComponent,
  type ViewProps,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const COLLAPSE_RANGE = 120;
const items = Array.from({ length: 40 }, (_, index) => `Item ${index + 1}`);

type CollapsingHeaderProps = ViewProps & { collapseRange: number };

const CollapsingHeaderView =
  Platform.OS === 'android'
    ? requireNativeComponent<CollapsingHeaderProps>('CollapsingHeaderView')
    : View;

export function Issue1249NestedScrollForwardingRepro() {
  const [height, setHeight] = useState(0);
  const [listScrolled, setListScrolled] = useState(false);

  if (Platform.OS !== 'android') {
    return <Text style={styles.status}>Android only</Text>;
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      <CollapsingHeaderView
        style={styles.container}
        collapseRange={COLLAPSE_RANGE}
      >
        <View testID="issue-1249-header" style={styles.header}>
          <Text style={styles.headerText}>Collapsing header</Text>
        </View>
        <View style={{ height }}>
          <Text testID="issue-1249-status" style={styles.status}>
            {`List scrolled: ${listScrolled ? 'yes' : 'no'}`}
          </Text>
          <PagerView testID="issue-1249-pager" style={styles.pager}>
            <View key="1" style={styles.page}>
              <ScrollView
                testID="issue-1249-list"
                nestedScrollEnabled
                refreshControl={
                  <RefreshControl refreshing={false} onRefresh={() => {}} />
                }
                scrollEventThrottle={16}
                onScroll={(e) =>
                  setListScrolled(e.nativeEvent.contentOffset.y > 0)
                }
              >
                {items.map((item) => (
                  <Text key={item} style={styles.item}>
                    {item}
                  </Text>
                ))}
              </ScrollView>
            </View>
            <View key="2" style={styles.page}>
              <Text>Page 2</Text>
            </View>
          </PagerView>
        </View>
      </CollapsingHeaderView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    height: COLLAPSE_RANGE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cde',
  },
  headerText: { fontSize: 18 },
  status: { padding: 12, fontSize: 16 },
  pager: { flex: 1 },
  page: { flex: 1 },
  item: {
    padding: 24,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});
