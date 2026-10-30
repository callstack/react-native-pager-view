/**
 * Repro for #1154: a focused TextInput must lose focus and hide the keyboard
 * when its page is left, via setPage or a swipe. The mode buttons focus the
 * new page's input from onPageSelected or right after setPage, which must
 * keep working.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2', 'Page 3'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd', '#fdf3e2'];

export function Issue1154PageChangeFocusRepro() {
  const pagerRef = useRef<PagerView>(null);
  const followUpCommand = useRef<{ at: number; go: number } | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [autoFocusMode, setAutoFocusMode] = useState<
    'off' | 'onSelected' | 'onPress'
  >('off');
  const [avoidsKeyboard, setAvoidsKeyboard] = useState(false);
  const inputRefs = useRef<Array<TextInputInstance | null>>([]);
  const lastRest = useRef(0);
  const lateCommand = useRef<ReturnType<typeof setTimeout> | null>(null);
  const log = (event: string) =>
    setEvents((current) => [...current.slice(-11), event]);

  // Each page command starts a fresh log and drops a follow-up left armed, so
  // a check waiting for the pager to report stopping cannot match a report
  // from an earlier command.
  const startCommand = () => {
    setEvents([]);
    followUpCommand.current = null;
    if (lateCommand.current) {
      clearTimeout(lateCommand.current);
      lateCommand.current = null;
    }
  };

  const goToPageThen = (first: number, second: number) => {
    startCommand();
    // A command for the page already shown sends no event, so a follow-up
    // armed for it would wait until some later visit and bounce the pager.
    followUpCommand.current =
      selectedPage === first ? null : { at: first, go: second };
    pagerRef.current?.setPage(first);
    if (autoFocusMode === 'onPress') {
      inputRefs.current[first]?.focus();
    }
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      log('keyboardShow');
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      log('keyboardHide');
    });
    return () => {
      show.remove();
      hide.remove();
      if (lateCommand.current) {
        clearTimeout(lateCommand.current);
      }
    };
  }, []);

  return (
    <View style={styles.screen}>
      <Text testID="issue-1154-status" style={styles.status}>
        Selected: {selectedPage} | Focused:{' '}
        {focusedInput === null ? 'none' : `input ${focusedInput}`} | Keyboard:{' '}
        {keyboardVisible ? 'visible' : 'hidden'}
      </Text>
      <Text testID="issue-1154-events" style={styles.events}>
        Events: {events.join(', ')}
      </Text>
      <View style={styles.buttons}>
        {PAGES.map((label, i) => (
          <Button
            key={label}
            testID={`issue-1154-go-${i}`}
            title={`Go ${i}`}
            onPress={() => {
              startCommand();
              pagerRef.current?.setPage(i);
              if (autoFocusMode === 'onPress') {
                inputRefs.current[i]?.focus();
              }
            }}
          />
        ))}
      </View>
      <View style={styles.buttons}>
        <Button
          testID="issue-1154-go-1-twice"
          title="Go 1 twice"
          onPress={() => goToPageThen(1, 1)}
        />
        <Button
          testID="issue-1154-go-2-then-1"
          title="Go 2 then 1"
          onPress={() => goToPageThen(2, 1)}
        />
        <Button
          testID="issue-1154-go-1-then-2"
          title="Go 1 then 2"
          onPress={() => goToPageThen(1, 2)}
        />
        <Button
          testID="issue-1154-go-1-and-0"
          title="Go 1 and 0"
          onPress={() => {
            startCommand();
            pagerRef.current?.setPage(1);
            pagerRef.current?.setPage(0);
          }}
        />
        <Button
          testID="issue-1154-go-1-then-2-late"
          title="Go 1 then 2 late"
          onPress={() => {
            startCommand();
            pagerRef.current?.setPage(1);
            inputRefs.current[1]?.focus();
            // Long enough for the focus to land, so the blur before a page
            // change is the one that catches it. The redirect lands the same
            // way if the slide finishes first, which keeps this off the clock.
            lateCommand.current = setTimeout(
              () => pagerRef.current?.setPage(2),
              200
            );
          }}
        />
      </View>
      <View style={styles.buttons}>
        {(['off', 'onSelected', 'onPress'] as const).map((mode) => (
          <Button
            key={mode}
            testID={`issue-1154-mode-${mode}`}
            title={`${autoFocusMode === mode ? '* ' : ''}${mode}`}
            onPress={() => setAutoFocusMode(mode)}
          />
        ))}
        <Button
          testID="issue-1154-avoid"
          title={`${avoidsKeyboard ? '* ' : ''}avoid`}
          onPress={() => setAvoidsKeyboard((current) => !current)}
        />
      </View>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        onPageScroll={(e) => {
          // The pager sends the snapped page with no offset just before it
          // reports stopping, which is where it actually came to rest.
          if (e.nativeEvent.offset === 0) {
            lastRest.current = e.nativeEvent.position;
          }
        }}
        onPageScrollStateChanged={(e) => {
          // Only idle is logged: a re-render while the finger is still down
          // changes how far the pager travels.
          if (e.nativeEvent.pageScrollState === 'idle') {
            log('state idle at ' + String(lastRest.current));
          }
        }}
        onPageSelected={(e) => {
          const position = e.nativeEvent.position;
          setSelectedPage(position);
          log(`selected ${position}`);
          // iOS reports the selection as the slide starts, so a command sent
          // from here always reaches the pager while it is still moving.
          const followUp = followUpCommand.current;
          if (followUp) {
            followUpCommand.current = null;
            if (position === followUp.at) {
              pagerRef.current?.setPage(followUp.go);
            }
          }
          if (autoFocusMode === 'onSelected') {
            inputRefs.current[position]?.focus();
          }
        }}
      >
        {PAGES.map((label, i) => (
          <KeyboardAvoidingView
            key={label}
            // A page that grows and shrinks with the keyboard, which is what an
            // app with an input on a page does. The blur before a slide closes
            // the keyboard, so the page relayouts as the slide starts.
            behavior={avoidsKeyboard ? 'padding' : undefined}
            style={[styles.page, { backgroundColor: PAGE_COLORS[i] }]}
          >
            <Text testID={`issue-1154-label-${i}`} style={styles.pageLabel}>
              {label}
            </Text>
            <TextInput
              ref={(input) => {
                inputRefs.current[i] = input;
              }}
              testID={`issue-1154-input-${i}`}
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
          </KeyboardAvoidingView>
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
    flexWrap: 'wrap',
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
