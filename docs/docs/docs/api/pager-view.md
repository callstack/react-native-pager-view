# PagerView

```tsx
import PagerView from 'react-native-pager-view';
```

`PagerView` is the default export. It accepts all standard [`View` props](https://reactnative.dev/docs/view#props) plus the props below. Every direct child becomes one page.

## Props

### `initialPage`

| Type | Default | Platform |
| --- | --- | --- |
| `number` | `0` | Android, iOS |

Index of the page that is selected on mount.

### `scrollEnabled`

| Type | Default | Platform |
| --- | --- | --- |
| `boolean` | `true` | Android, iOS |

Whether the user can swipe between pages.

### `orientation`

| Type | Default | Platform |
| --- | --- | --- |
| `'horizontal' \| 'vertical'` | `'horizontal'` | Android, iOS |

Scroll direction.

:::warning
Changing `orientation` after mount is not supported.
:::

### `layoutDirection`

| Type | Default | Platform |
| --- | --- | --- |
| `'ltr' \| 'rtl' \| 'locale'` | `'locale'` | Android, iOS |

Layout direction. Use `ltr` or `rtl` to set it explicitly, or `locale` to follow [`I18nManager.isRTL`](https://reactnative.dev/docs/i18nmanager).

### `pageMargin`

| Type | Default | Platform |
| --- | --- | --- |
| `number` | `0` | Android, iOS |

Blank space between pages.

### `keyboardDismissMode`

| Type | Default | Platform |
| --- | --- | --- |
| `'none' \| 'on-drag'` | `'none'` | Android, iOS |

Whether the keyboard is dismissed when the user drags the pager.

### `overdrag`

| Type | Default | Platform |
| --- | --- | --- |
| `boolean` | `false` | iOS |

Allows bouncing past the first and last page.

### `offscreenPageLimit`

| Type | Default | Platform |
| --- | --- | --- |
| `number` | `1` | Android |

Number of pages kept composed on each side of the visible page.

### `overScrollMode`

| Type | Default | Platform |
| --- | --- | --- |
| `'auto' \| 'always' \| 'never'` | `'auto'` | Android |

Overscroll effect at the edges. `never` disables the effect.

## Events

### `onPageScroll`

```ts
(event: PagerViewOnPageScrollEvent) => void
```

Called while moving between pages, either from a swipe or from an animated [`setPage`](#setpage). `event.nativeEvent` contains:

| Field | Type | Description |
| --- | --- | --- |
| `position` | `number` | Index of the first currently visible page. While swiping from page 1 to page 2, it is `1`. |
| `offset` | `number` | Progress from `position` to the next page, in the range `[0, 1)`. |

:::note Overdrag on iOS
On iOS with [`overdrag`](#overdrag), a bounce past the first page gives a negative `offset`, and a bounce past the last page gives a positive `offset` with `position` still on the last page.
:::

### `onPageSelected`

```ts
(event: PagerViewOnPageSelectedEvent) => void
```

Called when a new page becomes selected, and once on mount for `initialPage`. `event.nativeEvent.position` is the selected index.

### `onPageScrollStateChanged`

```ts
(event: PageScrollStateChangedNativeEvent) => void
```

Called when the scroll state changes. `event.nativeEvent.pageScrollState` is one of:

| Value | Meaning |
| --- | --- |
| `'idle'` | The pager is at rest. |
| `'dragging'` | The user is dragging the pager. |
| `'settling'` | The user released the pager and it is animating to its final page. On Android, an animated `setPage` also reports `settling`. |

## Methods

### `setPage`

```ts
setPage(index: number): void
```

Scrolls to the given page with an animation. An invalid index is ignored.

### `setPageWithoutAnimation`

```ts
setPageWithoutAnimation(index: number): void
```

Jumps to the given page without an animation. An invalid index is ignored.

### `setScrollEnabled`

```ts
setScrollEnabled(scrollEnabled: boolean): void
```

Enables or disables swiping imperatively. Prefer the [`scrollEnabled`](#scrollenabled) prop; use this when a re-render would get in the way, for example during an animation.
