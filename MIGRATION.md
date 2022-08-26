## Migration Guide

# 5.x -> 6.x
Due to some issues, support for the `transitionStyle` property, which was iOS only, has been dropped. In version **6.x** passing it will not have any effect.

# 5.0.x -> 5.1.x
Before:
```js
import ViewPager from '@react-native-community/viewpager'
import type { ViewPagerOnPageScrollEventData,ViewPagerOnPageSelectedEventData } from '@react-native-community/viewpager';
```

After:
```js
import PagerView from 'react-native-pager-view';
import type { PagerViewOnPageScrollEventData, PagerViewOnPageSelectedEventData } from 'react-native-pager-view';
