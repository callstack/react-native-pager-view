# Reanimated `onPageScroll` handler


To handle `onPageScroll` on the UI thread with [Reanimated](https://docs.swmansion.com/react-native-reanimated/), build an event handler with `useEvent` and pass it to an animated `PagerView`:

```tsx
import PagerView from 'react-native-pager-view';
import Animated, { useEvent, useHandler } from 'react-native-reanimated';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

function usePageScrollHandler(handlers, dependencies) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies);

  return useEvent(
    (event) => {
      'worklet';
      const { onPageScroll } = handlers;
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event, context);
      }
    },
    ['onPageScroll'],
    doDependenciesDiffer
  );
}

function MyPager() {
  const handler = usePageScrollHandler({
    onPageScroll: (e) => {
      'worklet';
      console.log(e.offset, e.position);
    },
  });

  return <AnimatedPagerView style={{ flex: 1 }} onPageScroll={handler} />;
}
```

See the [full example](https://github.com/callstack/react-native-pager-view/blob/main/example/src/ReanimatedOnPageScrollExample.tsx).
