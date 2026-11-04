# Types

The package ships TypeScript definitions. These types are exported:

```ts
import type {
  PagerViewProps,
  PagerViewOnPageScrollEvent,
  PagerViewOnPageScrollEventData,
  PagerViewOnPageSelectedEvent,
  PagerViewOnPageSelectedEventData,
  PageScrollStateChangedNativeEvent,
  PageScrollStateChangedNativeEventData,
  UsePagerViewProps,
} from 'react-native-pager-view';
```

## `PagerViewProps`

Props accepted by [`PagerView`](/docs/api/pager-view). Extends React Native's `ViewProps`.

## Event types

Each event type is a `NativeSyntheticEvent` wrapping its `*EventData` payload.

```ts
type PagerViewOnPageScrollEventData = Readonly<{
  position: number;
  offset: number;
}>;

type PagerViewOnPageSelectedEventData = Readonly<{
  position: number;
}>;

type PageScrollStateChangedNativeEventData = Readonly<{
  pageScrollState: 'idle' | 'dragging' | 'settling';
}>;

type PagerViewOnPageScrollEvent =
  NativeSyntheticEvent<PagerViewOnPageScrollEventData>;

type PagerViewOnPageSelectedEvent =
  NativeSyntheticEvent<PagerViewOnPageSelectedEventData>;

type PageScrollStateChangedNativeEvent =
  NativeSyntheticEvent<PageScrollStateChangedNativeEventData>;
```

Use the `*EventData` types as the generic argument of `Animated.event`:

```ts
Animated.event<PagerViewOnPageScrollEventData>(
  [{ nativeEvent: { offset: offsetValue, position: positionValue } }],
  { useNativeDriver: true }
);
```

## `UsePagerViewProps`

Return type of [`usePagerView`](/docs/api/use-pager-view).

## Ref type

`PagerView` is a class component, so the class itself is the ref type:

```ts
const ref = useRef<PagerView>(null);
```
