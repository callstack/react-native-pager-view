/**
 * The indicator has no JS listener, so only the native Animated driver can
 * move it.
 */
import React, { useMemo, useRef } from 'react';
import { Animated, Button, StyleSheet, Text, View } from 'react-native';
import PagerView, {
  type PagerViewOnPageScrollEventData,
  type PagerViewRef,
} from 'react-native-pager-view';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const INDICATOR_WIDTH = 100;

export function NativeDriverEventsExample() {
  const pager = useRef<PagerViewRef>(null);
  const position = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(0)).current;

  const onPageScroll = useMemo(
    () =>
      Animated.event<PagerViewOnPageScrollEventData>(
        [{ nativeEvent: { position, offset } }],
        { useNativeDriver: true }
      ),
    [position, offset]
  );

  const translateX = useMemo(
    () => Animated.multiply(Animated.add(position, offset), INDICATOR_WIDTH),
    [position, offset]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.track} testID="native-driver-track">
        <Animated.View
          testID="native-driver-indicator"
          style={[styles.indicator, { transform: [{ translateX }] }]}
        />
      </View>
      <View style={styles.buttons}>
        <Button
          testID="native-driver-page-0"
          title="setPage(0)"
          onPress={() => pager.current?.setPage(0)}
        />
        <Button
          testID="native-driver-page-2"
          title="setPage(2)"
          onPress={() => pager.current?.setPage(2)}
        />
      </View>
      <AnimatedPagerView
        ref={pager}
        testID="native-driver-pager"
        style={styles.pager}
        onPageScroll={onPageScroll}
      >
        {PAGES.map((label) => (
          <View key={label} style={styles.page}>
            <Text style={styles.label}>{label}</Text>
          </View>
        ))}
      </AnimatedPagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  track: {
    width: INDICATOR_WIDTH * PAGES.length,
    height: 8,
    margin: 16,
    alignSelf: 'center',
    backgroundColor: '#ddd',
  },
  indicator: {
    width: INDICATOR_WIDTH,
    height: 8,
    backgroundColor: '#63a4ff',
  },
  buttons: { flexDirection: 'row', justifyContent: 'center' },
  pager: { flex: 1 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 24 },
});
