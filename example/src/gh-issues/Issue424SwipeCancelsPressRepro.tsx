/**
 * Repro for #424 on Android: a swipe that starts on a Pressable in a page
 * must cancel the touch, so the Pressable does not fire onPress, while a tap
 * still presses it. "Block JS" keeps the JS thread busy for 5 s; a swipe in
 * that window could fire the press before the fix.
 */
import React, { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1'];
const BUSY_MS = 5000;

export function Issue424SwipeCancelsPressRepro() {
  const [selectedPage, setSelectedPage] = useState(0);
  const [presses, setPresses] = useState(0);
  const [touch, setTouch] = useState('none');

  return (
    <View style={styles.screen}>
      <Text testID="issue-424-status" style={styles.status}>
        {`Page: ${selectedPage} | Presses: ${presses} | Touch: ${touch}`}
      </Text>
      <Button
        testID="issue-424-block-js"
        title="Block JS"
        onPress={() => {
          const end = Date.now() + BUSY_MS;
          while (Date.now() < end) {
            // Busy-wait, like a JS thread stuck in a long task.
          }
        }}
      />
      <PagerView
        style={styles.pager}
        onPageSelected={(e) => setSelectedPage(e.nativeEvent.position)}
      >
        {PAGES.map((label, i) => (
          <View
            key={label}
            style={styles.page}
            onTouchStart={() => setTouch('start')}
            onTouchEnd={() => setTouch('end')}
            onTouchCancel={() => setTouch('cancel')}
          >
            <Pressable
              testID={`issue-424-button-${i}`}
              style={[styles.button, presses > 0 && styles.pressed]}
              onPress={() => setPresses((count) => count + 1)}
            >
              <Text style={styles.label}>
                {presses > 0 ? `Pressed ${presses}x` : label}
              </Text>
            </Pressable>
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
  button: {
    width: '80%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8fd',
  },
  pressed: { backgroundColor: '#f87171' },
  label: { fontSize: 24 },
});
