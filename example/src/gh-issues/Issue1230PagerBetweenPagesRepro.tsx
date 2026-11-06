/**
 * Repro for #1230. A `setPage`, a focus on the page it is sliding to and a
 * redirect sent from `onPageSelected` arrive together, which is the sequence
 * that had UIKit scroll the pager to the focused field and leave it between
 * two pages. The pager must end on the page asked for last, with the input it
 * left behind blurred.
 */
import React, { useRef, useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];

export function Issue1230PagerBetweenPagesRepro() {
  const pagerRef = useRef<PagerViewRef>(null);
  const redirectTo = useRef<number | null>(null);
  const inputRefs = useRef<Array<TextInputInstance | null>>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const log = (event: string) =>
    setEvents((current) => [...current.slice(-5), event]);

  // Nothing moves when the pager is already on page 1, so no redirect is
  // armed: one left armed would fire on a later arrival at that page.
  const strand = () => {
    setEvents([]);
    redirectTo.current = selectedPage === 1 ? null : 2;
    pagerRef.current?.setPage(1);
    inputRefs.current[1]?.focus();
  };

  return (
    <View style={styles.screen}>
      <Text testID="issue-1230-status" style={styles.status}>
        Selected: {selectedPage} | Focused:{' '}
        {focusedInput === null ? 'none' : `input ${focusedInput}`}
      </Text>
      <Text testID="issue-1230-events" style={styles.events}>
        Events: {events.join(', ')}
      </Text>
      <View style={styles.buttons}>
        <Button testID="issue-1230-strand" title="Strand" onPress={strand} />
      </View>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        onPageSelected={(e) => {
          const position = e.nativeEvent.position;
          setSelectedPage(position);
          log(`selected ${position}`);
          // iOS reports the selection as the slide starts, so this redirect
          // always reaches the pager while it is still moving.
          const target = redirectTo.current;
          if (target !== null && position === 1) {
            redirectTo.current = null;
            pagerRef.current?.setPage(target);
          }
        }}
        onPageScrollStateChanged={(e) => {
          if (e.nativeEvent.pageScrollState === 'idle') {
            log('idle');
          }
        }}
      >
        {PAGES.map((label, i) => (
          <View
            key={label}
            style={[styles.page, { backgroundColor: PAGE_COLORS[i] }]}
          >
            <Text testID={`issue-1230-label-${i}`} style={styles.pageLabel}>
              {label}
            </Text>
            <TextInput
              ref={(input) => {
                inputRefs.current[i] = input;
              }}
              testID={`issue-1230-input-${i}`}
              placeholder={`Input on ${label}`}
              style={styles.input}
              onFocus={() => {
                setFocusedInput(i);
                log(`focus ${i}`);
              }}
              onBlur={() => {
                setFocusedInput((current) => (current === i ? null : current));
                log(`blur ${i}`);
              }}
            />
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
  events: {
    // Fixed, because a log that reflows as it grows resizes the pager, which
    // stops a page change animating and hides the case this screen is for.
    height: 44,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 12,
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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 8,
    backgroundColor: 'white',
  },
});
