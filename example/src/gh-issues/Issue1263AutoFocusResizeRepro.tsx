/**
 * Repro for #1263: on Android, going to page 2 creates page 3, whose TextInput
 * autofocuses, and the focus event resizes the pager synchronously from a
 * worklet. That resize arrived while Compose was still measuring the pager and
 * crashed the app with "updateRootConstraints called while measuring".
 * Tap "Mount pager", then "Go to page 2". The app must keep running.
 */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  KeyboardProvider,
  useKeyboardContext,
  type FocusedInputLayoutChangedEvent,
} from 'react-native-keyboard-controller';
import PagerView from 'react-native-pager-view';
import Animated, {
  setNativeProps,
  useAnimatedRef,
  useEvent,
  useSharedValue,
} from 'react-native-reanimated';

function Repro() {
  const { setInputHandlers } = useKeyboardContext();
  const pagerRef = useRef<PagerView>(null);
  const containerRef = useAnimatedRef<Animated.View>();
  const isShrunk = useSharedValue(false);
  const [key, setKey] = useState(0);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const handler = useEvent<FocusedInputLayoutChangedEvent>(
    (event) => {
      'worklet';
      if (event.target === -1) {
        return;
      }
      isShrunk.value = !isShrunk.value;
      setNativeProps(containerRef, { height: isShrunk.value ? 300 : 400 });
    },
    ['onFocusedInputLayoutChanged']
  );

  useLayoutEffect(() => setInputHandlers(handler), [setInputHandlers, handler]);

  return (
    <View style={styles.screen}>
      <Text testID="issue-1263-status" style={styles.status}>
        {`selected page: ${selectedPage ?? '-'}`}
      </Text>
      <Button
        testID="issue-1263-mount"
        title="Mount pager"
        onPress={() => {
          setSelectedPage(null);
          setKey((current) => current + 1);
        }}
      />
      <Button
        testID="issue-1263-go-to-page-2"
        title="Go to page 2"
        onPress={() => pagerRef.current?.setPageWithoutAnimation(1)}
      />
      <Animated.View ref={containerRef} style={styles.container}>
        {key > 0 && (
          <PagerView
            ref={pagerRef}
            key={key}
            style={styles.pager}
            initialPage={0}
            onPageSelected={(e) => setSelectedPage(e.nativeEvent.position)}
          >
            <View key="0" collapsable={false} style={styles.page}>
              <Text>Page 1</Text>
            </View>
            <View key="1" collapsable={false} style={styles.page}>
              <Text>Page 2</Text>
            </View>
            <View key="2" collapsable={false} style={styles.page}>
              <Text>Page 3</Text>
              <TextInput
                testID="issue-1263-input"
                autoFocus
                placeholder="autoFocus"
                style={styles.input}
              />
            </View>
          </PagerView>
        )}
      </Animated.View>
    </View>
  );
}

export function Issue1263AutoFocusResizeRepro() {
  return (
    <KeyboardProvider>
      <Repro />
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  status: {
    padding: 12,
  },
  container: {
    height: 500,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    padding: 8,
  },
});
