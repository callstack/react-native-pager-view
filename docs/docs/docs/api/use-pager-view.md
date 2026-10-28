# usePagerView

```tsx
import { usePagerView } from 'react-native-pager-view';
```

`usePagerView` bundles the state and handlers you usually wire up yourself: the ref, the active page, the scroll state, the scroll progress, and helpers to add or remove pages and to toggle scrolling, animation and overdrag.

## Example

```tsx
import { View, Text } from 'react-native';
import { usePagerView } from 'react-native-pager-view';

export function PagerHookExample() {
  const { AnimatedPagerView, ref, ...rest } = usePagerView({ pagesAmount: 10 });

  return (
    <AnimatedPagerView
      ref={ref}
      style={{ flex: 1 }}
      initialPage={0}
      scrollEnabled={rest.scrollEnabled}
      overdrag={rest.overdrag}
      onPageScroll={rest.onPageScroll}
      onPageSelected={rest.onPageSelected}
      onPageScrollStateChanged={rest.onPageScrollStateChanged}
    >
      {rest.pages.map((page) => (
        <View key={page}>
          <Text>{`Page ${page}`}</Text>
        </View>
      ))}
    </AnimatedPagerView>
  );
}
```

See the [full example](https://github.com/callstack/react-native-pager-view/blob/main/example/src/PagerHookExample.tsx).

## Parameters

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `pagesAmount` | `number` | `0` | Number of pages to start with. The hook creates a `pages` array of indices `[0, 1, …, pagesAmount - 1]`. |

## Return value

### Wiring

| Name | Type | Description |
| --- | --- | --- |
| `ref` | `RefObject<PagerView>` | Pass it to the pager's `ref`. |
| `AnimatedPagerView` | component | `PagerView` wrapped with `Animated.createAnimatedComponent`. Required because `onPageScroll` and `onPageSelected` are `Animated.event` handlers using the native driver. |
| `PagerView` | component | The plain `PagerView` class, for convenience. |
| `onPageScroll` | handler | Pass to `onPageScroll`. Updates `progress`. |
| `onPageSelected` | handler | Pass to `onPageSelected`. Updates `activePage`. |
| `onPageScrollStateChanged` | handler | Pass to `onPageScrollStateChanged`. Updates `scrollState`. |

### State

| Name | Type | Description |
| --- | --- | --- |
| `pages` | `number[]` | Page indices. Use them as keys when rendering pages. |
| `activePage` | `number` | Index of the currently selected page. |
| `progress` | `{ position: number; offset: number }` | Latest values from `onPageScroll`. |
| `scrollState` | `string` | Latest value from `onPageScrollStateChanged`. |
| `scrollEnabled` | `boolean` | Pass to the `scrollEnabled` prop. Defaults to `true`. |
| `overdrag` | `boolean` | Pass to the `overdrag` prop. Defaults to `false`. |
| `isAnimated` | `boolean` | Whether `setPage` animates. Defaults to `true`. |

### Actions

| Name | Signature | Description |
| --- | --- | --- |
| `setPage` | `(page: number) => void` | Goes to `page`, with or without animation depending on `isAnimated`. |
| `addPage` | `() => void` | Appends a page to `pages`. |
| `removePage` | `() => void` | Removes the last page. Always keeps at least one. |
| `toggleScroll` | `() => void` | Toggles `scrollEnabled`. |
| `toggleAnimation` | `() => void` | Toggles `isAnimated`. |
| `toggleOverdrag` | `() => void` | Toggles `overdrag`. |
| `setProgress` | `(progress: { position: number; offset: number }) => void` | Overrides `progress` manually. |

## Types

```ts
import type { UsePagerViewProps } from 'react-native-pager-view';
```

`UsePagerViewProps` is the return type of `usePagerView`.
