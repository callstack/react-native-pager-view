import type { ReactElement } from 'react';
import { HostComponent, requireNativeComponent, UIManager } from 'react-native';
import type { PagerViewProps } from './types';

const VIEW_MANAGER_NAME = 'RNCViewPager';

interface PagerViewViewManagerType extends HostComponent<PagerViewProps> {
  getInnerViewNode(): ReactElement;
}

export const PagerViewViewManager = requireNativeComponent(
  VIEW_MANAGER_NAME
) as PagerViewViewManagerType;

export function getViewManagerConfig(viewManagerName = VIEW_MANAGER_NAME) {
  return UIManager.getViewManagerConfig(viewManagerName);
}
