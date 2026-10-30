# Usage

```tsx
import { StyleSheet, View, Text } from 'react-native';
import PagerView from 'react-native-pager-view';

export function MyPager() {
  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      <View key="1">
        <Text>First page</Text>
      </View>
      <View key="2">
        <Text>Second page</Text>
      </View>
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
});
```

## Rules for children

- Each **direct child** of `PagerView` becomes one page and is stretched to fill the pager.
- Give every child a **unique `key`**.
- `PagerView` needs a size. Give it `flex: 1` or an explicit `width`/`height`, otherwise it collapses to zero.

## Reacting to page changes

```tsx
<PagerView
  style={{ flex: 1 }}
  onPageSelected={(e) => {
    console.log('Selected page', e.nativeEvent.position);
  }}
>
  {pages}
</PagerView>
```

`onPageSelected` fires when a new page becomes selected, and once on mount for `initialPage`. To react while the pager is moving between pages, use [`onPageScroll`](/docs/api/pager-view#onpagescroll).

## Changing pages from code

To control the pager from code, keep a ref and call its [methods](/docs/api/pager-view#methods):

```tsx
const ref = useRef<PagerView>(null);

// ...
<PagerView ref={ref} style={{ flex: 1 }}>
  {pages}
</PagerView>;

// later
ref.current?.setPage(2);
```

For more complete examples, see the [example app](https://github.com/callstack/react-native-pager-view/tree/main/example/src): nested pagers, keyboard handling, tab views, pagination dots, carousels and more.
