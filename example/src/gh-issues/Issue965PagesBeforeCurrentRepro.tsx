/**
 * Repro for #965 and #808 on Android: inserting, removing or moving pages
 * before the current one must keep the current page visible and report its
 * new index once through onPageSelected. The pager starts on page C.
 */
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const INITIAL_PAGES = ['A', 'B', 'C', 'D'];

export function Issue965PagesBeforeCurrentRepro() {
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [selected, setSelected] = useState(0);
  const [events, setEvents] = useState(0);
  const insertedCount = useRef(0);
  const nextPage = () => `N${insertedCount.current++}`;
  const withoutC = (current: string[]) =>
    current.filter((page) => page !== 'C');
  const selectedPage = pages[selected] ?? '-';

  return (
    <View style={styles.screen}>
      <Text testID="issue-965-status" style={styles.status}>
        {`Selected: ${selected} (${selectedPage}) | Events: ${events}`}
      </Text>
      <Button
        testID="issue-965-insert-first"
        title="Insert first"
        onPress={() => setPages((current) => [nextPage(), ...current])}
      />
      <Button
        testID="issue-965-insert-before-c"
        title="Insert before C"
        onPress={() =>
          setPages((current) => {
            const index = current.indexOf('C');
            return [
              ...current.slice(0, index),
              nextPage(),
              ...current.slice(index),
            ];
          })
        }
      />
      <Button
        testID="issue-965-remove-first"
        title="Remove first"
        onPress={() => setPages((current) => current.slice(1))}
      />
      <Button
        testID="issue-965-remove-first-two"
        title="Remove first two"
        onPress={() => setPages((current) => current.slice(2))}
      />
      <Button
        testID="issue-965-move-c-first"
        title="Move C first"
        onPress={() => setPages((current) => ['C', ...withoutC(current)])}
      />
      <Button
        testID="issue-965-move-c-last"
        title="Move C last"
        onPress={() => setPages((current) => [...withoutC(current), 'C'])}
      />
      <PagerView
        style={styles.pager}
        initialPage={2}
        onPageSelected={(e) => {
          setSelected(e.nativeEvent.position);
          setEvents((count) => count + 1);
        }}
      >
        {pages.map((page) => (
          <View key={page} style={styles.page}>
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
  label: { fontSize: 24 },
});
