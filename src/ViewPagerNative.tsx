import type { ReactElement } from 'react';
import { HostComponent, requireNativeComponent, UIManager } from 'react-native';
import type { ViewPagerProps } from './types';

const VIEW_MANAGER_NAME = 'RNCViewPager';

interface ViewpagerViewManagerType extends HostComponent<ViewPagerProps> {
  getInnerViewNode(): ReactElement;
}

export const ViewpagerViewManager = requireNativeComponent(
  VIEW_MANAGER_NAME
) as ViewpagerViewManagerType;

export function getViewManagerConfig(viewManagerName = VIEW_MANAGER_NAME) {
  return UIManager.getViewManagerConfig(viewManagerName);
}
