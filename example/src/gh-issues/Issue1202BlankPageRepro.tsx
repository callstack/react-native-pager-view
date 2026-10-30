/**
 * Repro for #1202: on iOS, a page shown by setPage must not be blank. The
 * event log above the pager changes length on every page change, which the
 * bug needs.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];

export function Issue1202BlankPageRepro() {
  const pagerRef = useRef<PagerView>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const log = (event: string) =>
    setEvents((current) => [...current.slice(-11), event]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      log('keyboardShow');
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      log('keyboardHide');
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View style={styles.screen}>
      <Text testID="issue-1202-status" style={styles.status}>
        Selected: {selectedPage} | Focused:{' '}
        {focusedInput === null ? 'none' : `input ${focusedInput}`}
      </Text>
      <Text testID="issue-1202-events" style={styles.events}>
        Events: {events.join(', ')}
      </Text>
      <View style={styles.buttons}>
        {PAGES.map((label, i) => (
          <Button
            key={label}
            testID={`issue-1202-go-${i}`}
            title={`Go ${i}`}
            onPress={() => {
              setEvents([]);
              pagerRef.current?.setPage(i);
            }}
          />
        ))}
      </View>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        onPageSelected={(e) => {
          setSelectedPage(e.nativeEvent.position);
          log(`selected ${e.nativeEvent.position}`);
        }}
        onPageScrollStateChanged={(e) => {
          if (e.nativeEvent.pageScrollState === 'idle') {
            log('state idle');
          }
        }}
      >
        {PAGES.map((label, i) => (
          <View
            key={label}
            style={[styles.page, { backgroundColor: PAGE_COLORS[i] }]}
          >
            <Text testID={`issue-1202-label-${i}`} style={styles.pageLabel}>
              {label}
            </Text>
            <TextInput
              testID={`issue-1202-input-${i}`}
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
    paddingHorizontal: 12,
    paddingBottom: 12,
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
