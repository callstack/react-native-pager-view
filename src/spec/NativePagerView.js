/**
 * @flow strict-local
 */

 import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
 import type {
   WithDefault,
   Int32,
   Float,
   BubblingEventHandler,
 } from 'react-native/Libraries/Types/CodegenTypes';
 import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
 import type { HostComponent } from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';
 
 type PageScrollEvent = $ReadOnly<{|
    position: Int32,
    offset: Float,
|}>;

type PageSelectedEvent = $ReadOnly<{|
  position: Int32,
|}>;

type PageScrollStateChangedEvent = $ReadOnly<{|
  pageScrollState: 'idle' | 'dragging' | 'settling',
|}>;

 type NativeProps = $ReadOnly<{|
   ...ViewProps,
   onPageScroll?: ?BubblingEventHandler<PageScrollEvent>,
  onPageSelected?: ?BubblingEventHandler<PageSelectedEvent>,
  onPageScrollStateChanged?: ?BubblingEventHandler<PageScrollStateChangedEvent>,
   initialPage?: WithDefault<Int32, 0>,
   pageMargin?: WithDefault<Int32, 0>,
   keyboardDismissMode?: WithDefault<'none' | 'on-drag', 'none'>,
   orientation?: WithDefault<'horizontal' | 'vertical', 'horizontal'>,
   overdrag?: boolean,
  scrollEnabled?: boolean,
 |}>;
 
 export default (codegenNativeComponent<NativeProps>(
   'RNCViewPager'
 ): HostComponent<NativeProps>);
 