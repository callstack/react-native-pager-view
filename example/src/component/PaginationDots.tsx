import React from 'react';
import { Animated, I18nManager, StyleSheet, View } from 'react-native';

const ACTIVE_COLOR = '#347af0';
const INACTIVE_COLOR = '#000';

interface Props {
  // Fractional page index: position + offset from onPageScroll.
  progress: ReturnType<typeof Animated.add>;
  count: number;
  testID?: string;
}

const pageRange = (index: number) => [index - 1, index, index + 1];

const slideX = (progress: Props['progress'], step: number) =>
  Animated.multiply(progress, I18nManager.isRTL ? -step : step);

const interpolate = <T extends number | string>(
  progress: Props['progress'],
  index: number,
  inactive: T,
  active: T
) =>
  progress.interpolate<T>({
    inputRange: pageRange(index),
    outputRange: [inactive, active, inactive],
    extrapolate: 'clamp',
  });

export function ExpandingDots({ progress, count, testID }: Props) {
  return (
    <View testID={testID} style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: interpolate(progress, index, 10, 30),
              opacity: interpolate(progress, index, 0.6, 1),
              backgroundColor: ACTIVE_COLOR,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function ScalingDots({ progress, count, testID }: Props) {
  return (
    <View testID={testID} style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: interpolate(progress, index, 0.5, 1),
              transform: [{ scale: interpolate(progress, index, 1, 1.4) }],
              backgroundColor: interpolate(
                progress,
                index,
                INACTIVE_COLOR,
                ACTIVE_COLOR
              ),
            },
          ]}
        />
      ))}
    </View>
  );
}

const BORDER_SIZE = 20;

export function SlidingBorder({ progress, count, testID }: Props) {
  const translateX = slideX(progress, BORDER_SIZE);
  return (
    <View testID={testID} style={styles.row}>
      <Animated.View
        style={[styles.slidingBorder, { transform: [{ translateX }] }]}
      />
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.borderSlot}>
          <View style={styles.smallDot} />
        </View>
      ))}
    </View>
  );
}

const SLIDING_DOT_SIZE = 12;
const SLIDING_DOT_MARGIN = 3;

export function SlidingDot({ progress, count, testID }: Props) {
  const translateX = slideX(
    progress,
    SLIDING_DOT_SIZE + SLIDING_DOT_MARGIN * 2
  );
  return (
    <View testID={testID} style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.slidingDot, styles.inactive]} />
      ))}
      <Animated.View
        style={[
          styles.slidingDot,
          styles.slidingDotActive,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  inactive: {
    backgroundColor: ACTIVE_COLOR,
    opacity: 0.3,
  },
  slidingBorder: {
    position: 'absolute',
    width: BORDER_SIZE,
    height: BORDER_SIZE,
    borderRadius: BORDER_SIZE / 2,
    borderWidth: 1,
    borderColor: ACTIVE_COLOR,
  },
  borderSlot: {
    width: BORDER_SIZE,
    height: BORDER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACTIVE_COLOR,
  },
  slidingDot: {
    width: SLIDING_DOT_SIZE,
    height: SLIDING_DOT_SIZE,
    borderRadius: SLIDING_DOT_SIZE / 2,
    marginHorizontal: SLIDING_DOT_MARGIN,
  },
  slidingDotActive: {
    position: 'absolute',
    start: 0,
    backgroundColor: ACTIVE_COLOR,
  },
});
