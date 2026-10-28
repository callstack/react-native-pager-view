import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Animated } from 'react-native';
import PagerView, {
  PagerViewOnPageScrollEventData,
  type PagerViewRef,
} from 'react-native-pager-view';

import {
  ExpandingDots,
  ScalingDots,
  SlidingBorder,
  SlidingDot,
} from './component/PaginationDots';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

const INTRO_DATA = [
  {
    key: '1',
    title: 'App showcase ✨',
    description:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
  {
    key: '2',
    title: 'Introduction screen 🎉',
    description:
      "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. ",
  },
  {
    key: '3',
    title: 'And can be anything 🎈',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. ',
  },
  {
    key: '4',
    title: 'And can be anything 🎈',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. ',
  },
];

export default function PaginationDotsExample() {
  const ref = React.useRef<PagerViewRef>(null);
  const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current;
  const positionAnimatedValue = React.useRef(new Animated.Value(0)).current;
  const progress = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  );

  const onPageScroll = React.useMemo(
    () =>
      Animated.event<PagerViewOnPageScrollEventData>(
        [
          {
            nativeEvent: {
              offset: scrollOffsetAnimatedValue,
              position: positionAnimatedValue,
            },
          },
        ],
        {
          useNativeDriver: false,
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <SafeAreaView testID="safe-area-view" style={styles.flex}>
      <AnimatedPagerView
        testID="pager-view"
        initialPage={0}
        ref={ref}
        style={styles.PagerView}
        onPageScroll={onPageScroll}
      >
        {INTRO_DATA.map(({ key }) => (
          <View
            testID={`pager-view-data-${key}`}
            key={key}
            style={styles.center}
          >
            <Text style={styles.text}>{`Page Index: ${key}`}</Text>
          </View>
        ))}
      </AnimatedPagerView>
      <View style={styles.dotsContainer}>
        <View style={styles.dotContainer}>
          <Text>Expanding Dot</Text>
          <ExpandingDots
            testID="expanding-dot"
            progress={progress}
            count={INTRO_DATA.length}
          />
        </View>
        <View style={styles.dotContainer}>
          <Text>Scaling Dot</Text>
          <ScalingDots
            testID="scaling-dot"
            progress={progress}
            count={INTRO_DATA.length}
          />
        </View>
        <View style={styles.dotContainer}>
          <Text>Sliding Border</Text>
          <SlidingBorder
            testID="sliding-border"
            progress={progress}
            count={INTRO_DATA.length}
          />
        </View>
        <View style={styles.dotContainer}>
          <Text>Sliding Dot</Text>
          <SlidingDot
            testID="sliding-dot"
            progress={progress}
            count={INTRO_DATA.length}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  PagerView: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#63a4ff',
  },
  progressContainer: { flex: 0.1, backgroundColor: '#63a4ff' },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 30,
  },
  separator: {
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  touchableTitle: {
    textAlign: 'center',
    color: '#000',
  },
  touchableTitleActive: {
    color: '#fff',
  },
  dotsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  dotContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  contentSlider: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dots: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 310,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
  },
});
