import codegenNativeComponent, {
  NativeComponentType,
} from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type * as React from 'react';
import type { ViewProps } from 'react-native';

const VIEW_MANAGER_NAME = 'PagerViewView';

interface NativeProps extends ViewProps {
  color?: string;
}

export type PagerViewViewType = NativeComponentType<NativeProps>;

// export interface NativeCommands {
//   setPage: (
//     viewRef: React.ElementRef<PagerViewViewType>,
//     selectedPage: number
//   ) => void;
//   setPageWithoutAnimation: (
//     viewRef: React.ElementRef<PagerViewViewType>,
//     selectedPage: number
//   ) => void;
//   setScrollEnabled: (
//     viewRef: React.ElementRef<PagerViewViewType>,
//     scrollEnabled: boolean
//   ) => void;
// }

// export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
//   supportedCommands: ['setPage', 'setPageWithoutAnimation', 'setScrollEnabled'],
// });

export default codegenNativeComponent<NativeProps>(VIEW_MANAGER_NAME);
