/**
 * Repro for #1196 and the Android side of #949: setPage and
 * setPageWithoutAnimation for a page added in the same commit must select it.
 * An index that isn't there yet is still ignored, and isn't applied later when
 * the page arrives.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const PAGES = ['A', 'B', 'C', 'D'];
const COLORS: Record<string, string> = {
  A: '#fca5a5',
  B: '#86efac',
  C: '#93c5fd',
  D: '#fde68a',
};

type PendingCommand = 'instant' | 'animated' | 'effect' | null;

export function Issue1196SetPageAfterAddRepro() {
  const pagerRef = useRef<PagerView>(null);
  const pending = useRef<PendingCommand>(null);
  const [count, setCount] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [events, setEvents] = useState(0);

  useLayoutEffect(() => {
    if (pending.current === 'instant') {
      pagerRef.current?.setPageWithoutAnimation(count - 1);
    } else if (pending.current === 'animated') {
      pagerRef.current?.setPage(count - 1);
    } else {
      return;
    }
    pending.current = null;
  }, [count]);

  useEffect(() => {
    if (pending.current === 'effect') {
      pending.current = null;
      pagerRef.current?.setPage(count - 1);
    }
  }, [count]);

  const addPages = (command: PendingCommand) => {
    pending.current = command;
    setCount(PAGES.length);
  };

  return (
    <View style={styles.screen}>
      <Text testID="issue-1196-status" style={styles.status}>
        {`Pages: ${count} | Selected: ${selected ?? '-'} | Events: ${events}`}
      </Text>
      <Button
        testID="issue-1196-add-select-d"
        title="Add pages, select D"
        onPress={() => addPages('instant')}
      />
      <Button
        testID="issue-1196-add-animate-d"
        title="Add pages, animate to D"
        onPress={() => addPages('animated')}
      />
      <Button
        testID="issue-1196-add-select-d-effect"
        title="Add pages, animate to D (useEffect)"
        onPress={() => addPages('effect')}
      />
      <Button
        testID="issue-1196-add"
        title="Add pages"
        onPress={() => addPages(null)}
      />
      <Button
        testID="issue-1196-select-d"
        title="Select D"
        onPress={() => pagerRef.current?.setPageWithoutAnimation(3)}
      />
      <Button
        testID="issue-1196-remove-pages"
        title="Remove pages"
        onPress={() => setCount(0)}
      />
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => {
          setSelected(e.nativeEvent.position);
          setEvents((value) => value + 1);
        }}
      >
        {PAGES.slice(0, count).map((page) => (
          <View
            key={page}
            style={[styles.page, { backgroundColor: COLORS[page] }]}
          >
            <Text style={styles.label}>{`Page ${page}`}</Text>
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
  label: { fontSize: 32, fontWeight: 'bold' },
});
