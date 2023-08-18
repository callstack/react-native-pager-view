import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, { useHandler, useEvent } from 'react-native-reanimated';

const AnimatedPager = Animated.createAnimatedComponent(PagerView);

export function usePagerScrollHandler(handlers: any, dependencies?: any) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies);
  const subscribeForEvents = ['onPageScroll'];

  return useEvent<any>(
    (event) => {
      'worklet';
      const { onPageScroll } = handlers;
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event, context);
      }
    },
    subscribeForEvents,
    doDependenciesDiffer
  );
}

export default () => {
  const handler = usePagerScrollHandler({
    onPageScroll: (e: any) => {
      'worklet';
      console.log(e.offset, e.position);
    },
  });

  return (
    <AnimatedPager
      testID={'pager-view'}
      style={styles.pagerView}
      initialPage={0}
      onPageScroll={handler}
    >
      <View testID={'1'} key="1">
        <Text>First page</Text>
      </View>
      <View testID={'2'} key="2">
        <Text>Second page</Text>
      </View>
      <View testID={'3'} key="3">
        <Text>Third page</Text>
      </View>
    </AnimatedPager>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
});
