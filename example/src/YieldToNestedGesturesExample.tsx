// Rows in a list on each page have their own horizontal pan
// (react-native-gesture-handler). With `yieldToNestedGestures` off, dragging a
// row pages; on, the row moves and only a drag that starts in the gutter beside
// the list pages. iOS only: the prop is a no-op on Android.
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import PagerView from 'react-native-pager-view';
import { colors, radius } from './theme';

const PAGES = [0, 1, 2];
const ROWS = [0, 1, 2];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];
const MAX_OFFSET = 80;
const ACTIVE_OFFSET = 24;

export function YieldToNestedGesturesExample() {
  const [yieldToNestedGestures, setYieldToNestedGestures] = useState(false);
  const [page, setPage] = useState(0);
  const [moved, setMoved] = useState('none');

  return (
    <GestureHandlerRootView style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.toggle}>
          <Text style={styles.toggleLabel}>yieldToNestedGestures</Text>
          <Switch
            testID="yield-nested-toggle"
            value={yieldToNestedGestures}
            onValueChange={setYieldToNestedGestures}
          />
        </View>
        <Text testID="yield-nested-status" style={styles.status}>
          Yield: {yieldToNestedGestures ? 'on' : 'off'} | Page: {page} | Moved:{' '}
          {moved}
        </Text>
        <Text style={styles.hint}>
          {Platform.OS === 'ios'
            ? 'Drag a row, then drag the dashed gutter beside it.'
            : 'iOS only: on Android the prop does nothing.'}
        </Text>
      </View>
      <PagerView
        testID="yield-nested-pager"
        style={styles.pager}
        yieldToNestedGestures={yieldToNestedGestures}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {PAGES.map((pageIndex) => (
          <View
            key={pageIndex}
            style={[styles.page, { backgroundColor: PAGE_COLORS[pageIndex] }]}
          >
            <Text style={styles.pageLabel}>Page {pageIndex}</Text>
            <View style={styles.content}>
              <ScrollView
                testID={`yield-nested-list-${pageIndex}`}
                style={styles.list}
                contentContainerStyle={styles.rows}
              >
                {ROWS.map((rowIndex) => (
                  <SwipeableRow
                    key={rowIndex}
                    id={`${pageIndex}-${rowIndex}`}
                    onMoved={setMoved}
                  />
                ))}
              </ScrollView>
              <View
                testID={`yield-nested-gutter-${pageIndex}`}
                style={styles.gutter}
              >
                <Text style={styles.gutterText}>Pages</Text>
              </View>
            </View>
          </View>
        ))}
      </PagerView>
    </GestureHandlerRootView>
  );
}

/** A row that follows a horizontal drag and stays where it is dropped. */
function SwipeableRow({
  id,
  onMoved,
}: {
  id: string;
  onMoved: (id: string) => void;
}) {
  const offset = useSharedValue(0);
  const start = useSharedValue(0);

  const pan = usePanGesture({
    // Further than the pager's own pan needs to start, so that without
    // `yieldToNestedGestures` the pager always starts first and pages. With
    // about the same distance, which of the two starts first varies.
    activeOffsetX: [-ACTIVE_OFFSET, ACTIVE_OFFSET],
    failOffsetY: [-10, 10],
    onActivate: () => {
      'worklet';
      start.value = offset.value;
    },
    onUpdate: (e) => {
      'worklet';
      offset.value = Math.max(
        -MAX_OFFSET,
        Math.min(MAX_OFFSET, start.value + e.translationX)
      );
    },
    onDeactivate: () => {
      'worklet';
      scheduleOnRN(onMoved, id);
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        testID={`yield-nested-row-${id}`}
        style={[styles.row, style]}
      >
        <Text style={styles.rowText}>Row {id}</Text>
        <Text style={styles.rowHint}>⇆</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 12,
    gap: 6,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  status: {
    fontSize: 16,
    color: colors.foreground,
  },
  hint: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  pageLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.foreground,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  list: {
    flex: 1,
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowText: {
    fontSize: 16,
    color: colors.foreground,
  },
  rowHint: {
    fontSize: 18,
    color: colors.mutedForeground,
  },
  gutter: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.mutedForeground,
  },
  gutterText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
});
