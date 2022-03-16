/**
 * @flow strict-local
 */

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  WithDefault,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';

//TODO implement all types here
type NativeProps = $ReadOnly<{|
  ...ViewProps,
  initialPage?: WithDefault<Int32, 0>,
  pageMargin?: WithDefault<Int32, 0>,
  keyboardDismissMode?: WithDefault<'none' | 'on-drag', 'none'>,
  orientation?: WithDefault<'horizontal' | 'vertical', 'horizontal'>,
  overdrag?: boolean,
|}>;

export default (codegenNativeComponent<NativeProps>(
  'RNCViewPager'
): HostComponent<NativeProps>);
