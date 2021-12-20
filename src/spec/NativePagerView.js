
/**
 * @flow strict-local
 */

 import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
 import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
 import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
 
 type NativeProps = $ReadOnly<{|
   ...ViewProps
 |}>;
 
 export default (codegenNativeComponent<NativeProps>('RNCViewPager'): HostComponent<NativeProps>);
 