/**
 * Repro for #1096: SwiftUI keyboard avoidance must not shrink PagerView pages.
 *
 * The pager sits in a bottom sheet that follows the keyboard with a transform,
 * like react-native-keyboard-controller's KeyboardStickyView. React Native
 * keeps the page at full height, but without the fix the page is framed to a
 * keyboard-shrunk GeometryReader: the lower rows are clipped, and their native
 * frames no longer match where React Native laid them out, so taps miss them.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const ROWS = ['Row 1', 'Row 2', 'Row 3', 'Row 4', 'Row 5'];

function useKeyboardLift() {
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (event) => {
      Animated.timing(lift, {
        toValue: -event.endCoordinates.height,
        duration: event.duration,
        useNativeDriver: true,
      }).start();
    });
    const hide = Keyboard.addListener('keyboardWillHide', (event) => {
      Animated.timing(lift, {
        toValue: 0,
        duration: event.duration,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [lift]);

  return lift;
}

export function Issue1096KeyboardShrinkRepro() {
  const lift = useKeyboardLift();
  const [lastRowTaps, setLastRowTaps] = useState(0);

  return (
    <View style={styles.screen} testID="issue-1096-screen">
      <Text style={styles.description}>
        Focus the input. All five rows must stay visible above the input, and
        tapping Row 5 must increment the counter.
      </Text>
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: lift }] }]}
      >
        <PagerView
          style={styles.pager}
          initialPage={0}
          testID="issue-1096-pager"
        >
          <View key="rows" style={styles.page} collapsable={false}>
            {ROWS.map((row, index) =>
              index === ROWS.length - 1 ? (
                <Pressable
                  key={row}
                  style={styles.row}
                  testID="issue-1096-last-row"
                  onPress={() => setLastRowTaps((count) => count + 1)}
                >
                  <Text style={styles.rowText}>{row}</Text>
                </Pressable>
              ) : (
                <View key={row} style={styles.row}>
                  <Text style={styles.rowText}>{row}</Text>
                </View>
              )
            )}
          </View>
          <View key="second" style={styles.page} collapsable={false}>
            <Text style={styles.rowText}>Second page</Text>
          </View>
        </PagerView>
        <Text testID="issue-1096-counter" style={styles.counter}>
          {`last-row taps: ${lastRowTaps}`}
        </Text>
        <TextInput
          testID="issue-1096-input"
          placeholder="Focus me"
          style={styles.input}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  description: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  sheet: {
    backgroundColor: 'magenta',
    paddingBottom: 34,
  },
  pager: {
    height: 5 * 56,
  },
  page: {
    flex: 1,
    backgroundColor: '#b9f6ca',
  },
  row: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000033',
  },
  rowText: {
    color: '#111111',
    fontSize: 18,
  },
  counter: {
    padding: 8,
    color: '#ffffff',
    fontWeight: '600',
  },
  input: {
    height: 44,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
});
