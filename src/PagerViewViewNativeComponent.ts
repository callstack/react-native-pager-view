import codegenNativeComponent, {
  NativeComponentType,
} from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type * as React from 'react';
import type { PagerViewProps } from './types';

const VIEW_MANAGER_NAME = 'PagerViewView';

export type PagerViewViewType = NativeComponentType<PagerViewProps>;

export interface NativeCommands {
  setPage: (
    viewRef: React.ElementRef<PagerViewViewType>,
    selectedPage: number
  ) => void;
  setPageWithoutAnimation: (
    viewRef: React.ElementRef<PagerViewViewType>,
    selectedPage: number
  ) => void;
  setScrollEnabled: (
    viewRef: React.ElementRef<PagerViewViewType>,
    scrollEnabled: boolean
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setPage', 'setPageWithoutAnimation', 'setScrollEnabled'],
});

export default codegenNativeComponent<PagerViewProps>(VIEW_MANAGER_NAME);
