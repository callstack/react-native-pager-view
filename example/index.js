import React, { useMemo } from 'react';
import { AppRegistry, View, SafeAreaView, Animated, Text } from 'react-native';
import { Navigation } from './src/App';
import { name as appName } from './app.json';
import { BasicPagerViewExample } from './src/BasicPagerViewExample';
import PagerView from 'react-native-pager-view';
import { useNavigationPanel } from './src/hook/useNavigationPanel';
import { LikeCount } from './src/component/LikeCount';
import { NavigationPanel } from './src/component/NavigationPanel';
import { PaperExample } from './src/PaperExample';

// AppRegistry.registerComponent('Paper', () => (props) => {
//   const { ref, ...navigationPanel } = useNavigationPanel();
//   return (
//     <PagerView
//       //@ts-ignore
//       testID="pager-view"
//       ref={ref}
//       style={{ flex: 1 }}
//       initialPage={0}
//       layoutDirection="ltr"
//       pageMargin={10}
//       // Lib does not support dynamically orientation change
//       orientation="horizontal"
//     >
//       {useMemo(
//         () =>
//           navigationPanel.pages.map((page, index) => (
//             <View key={page.key} style={page.style} collapsable={false}>
//               <LikeCount />
//               <Text
//                 testID={`pageNumber${index}`}
//               >{`page number ${index}`}</Text>
//             </View>
//           )),
//         [navigationPanel.pages]
//       )}
//     </PagerView>
//   );
// });

// AppRegistry.registerComponent('Paper', () => (props) => {
//   const { ref, ...navigationPanel } = useNavigationPanel();
//   return <LikeCount />;
// });

AppRegistry.registerComponent(appName, () => Navigation);
AppRegistry.registerComponent('Paper', () => (props) => {
  return <PaperExample />;
});
