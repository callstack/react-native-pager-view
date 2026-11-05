# Migration

## 9.x → 10.x

`PagerView` is now a function component. Props did not change.

- Type refs with [`PagerViewRef`](/docs/api/types#pagerviewref) instead of `PagerView`. The ref is the native view with the [methods](/docs/api/pager-view#methods) attached; `ref.current.pagerView` is deprecated.
- Subclassing `PagerView` is no longer possible. Wrap it in your own component instead.
- On Android, `keyboardDismissMode="on-drag"` dismisses the keyboard only when a drag starts, not on `setPage`.
- On iOS, leaving a page now hides the keyboard if an input on that page is focused.

## 8.x → 9.x

The Android implementation moved from `ViewPager2` to Jetpack Compose. The JavaScript API did not change.

## 7.x → 8.x

The iOS implementation moved from `UIPageViewController` to SwiftUI. The JavaScript API did not change.

## 6.x → 7.x

Only the New Architecture is supported. Enable it in your app before upgrading.
