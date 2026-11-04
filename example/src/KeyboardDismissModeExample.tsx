// The input sits outside the pager: leaving a page blurs the inputs on it.
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];

export function KeyboardDismissModeExample() {
  const pagerRef = useRef<PagerViewRef>(null);
  const [mode, setMode] = useState<'none' | 'on-drag'>('on-drag');
  const [page, setPage] = useState(0);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.screen}>
      <Text testID="keyboard-dismiss-status" style={styles.status}>
        Mode: {mode} | Page: {page} | Focused: {focused ? 'yes' : 'no'}
      </Text>
      <View style={styles.buttons}>
        {(['none', 'on-drag'] as const).map((value) => (
          <Button
            key={value}
            testID={`keyboard-dismiss-mode-${value}`}
            title={`${mode === value ? '* ' : ''}${value}`}
            onPress={() => setMode(value)}
          />
        ))}
        <Button
          testID="keyboard-dismiss-next"
          title="Next page"
          onPress={() =>
            pagerRef.current?.setPage(Math.min(page + 1, PAGES.length - 1))
          }
        />
      </View>
      <TextInput
        testID="keyboard-dismiss-input"
        placeholder="Focus me, then drag the pager"
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        keyboardDismissMode={mode}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {PAGES.map((label, i) => (
          <View
            key={label}
            style={[styles.page, { backgroundColor: PAGE_COLORS[i] }]}
          >
            <Text
              testID={`keyboard-dismiss-label-${i}`}
              style={styles.pageLabel}
            >
              {label}
            </Text>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  status: {
    padding: 12,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 12,
  },
  input: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'black',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    padding: 24,
  },
  pageLabel: {
    fontSize: 24,
    fontWeight: '600',
  },
});
