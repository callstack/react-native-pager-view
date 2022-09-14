export * from './types';
import { PagerView } from './PagerView';
export default PagerView;

import type { PagerViewOnPageScrollEventData } from './PagerViewViewNativeComponent';
import type { PagerViewOnPageSelectedEventData } from './PagerViewViewNativeComponent';
import type { PageScrollStateChangedEvent } from './PagerViewViewNativeComponent';

export {
  PagerViewOnPageScrollEventData,
  PagerViewOnPageSelectedEventData,
  PageScrollStateChangedEvent,
};
