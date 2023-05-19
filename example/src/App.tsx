import { enableScreens } from 'react-native-screens';
// run this before any screen render(usually in App.js)
enableScreens();

import * as React from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Button,
  Alert,
  I18nManager,
  DevSettings,
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BasicPagerViewExample } from './BasicPagerViewExample';
import { KeyboardExample } from './KeyboardExample';
import { OnPageScrollExample } from './OnPageScrollExample';
import { OnPageSelectedExample } from './OnPageSelectedExample';
import { ScrollablePagerViewExample } from './ScrollablePagerViewExample';
import { ScrollViewInsideExample } from './ScrollViewInsideExample';
import HeadphonesCarouselExample from './HeadphonesCarouselExample';
import PaginationDotsExample from './PaginationDotsExample';
import { NestPagerView } from './NestPagerView';
import ScrollableTabBarExample from './tabView/ScrollableTabBarExample';
import AutoWidthTabBarExample from './tabView/AutoWidthTabBarExample';
import TabBarIconExample from './tabView/TabBarIconExample';
import CustomIndicatorExample from './tabView/CustomIndicatorExample';
import CustomTabBarExample from './tabView/CustomTabBarExample';
import CoverflowExample from './tabView/CoverflowExample';
import ReanimatedOnPageScrollExample from './ReanimatedOnPageScrollExample';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const examples = [
  { component: BasicPagerViewExample, name: 'Basic Example' },
  { component: KeyboardExample, name: 'Keyboard Example' },
  { component: OnPageScrollExample, name: 'OnPageScroll Example' },
  { component: OnPageSelectedExample, name: 'OnPageSelected Example' },
  { component: HeadphonesCarouselExample, name: 'Headphones Carousel Example' },
  { component: PaginationDotsExample, name: 'Pagination Dots Example' },
  {
    component: ScrollablePagerViewExample,
    name: 'Scrollable PagerView Example',
  },
  {
    component: ScrollViewInsideExample,
    name: 'ScrollView inside PagerView Example',
  },
  {
    component: NestPagerView,
    name: 'Nest PagerView Example',
  },
  { component: ScrollableTabBarExample, name: 'ScrollableTabBarExample' },
  { component: AutoWidthTabBarExample, name: 'AutoWidthTabBarExample' },
  { component: TabBarIconExample, name: 'TabBarIconExample' },
  { component: CustomIndicatorExample, name: 'CustomIndicatorExample' },
  { component: CustomTabBarExample, name: 'CustomTabBarExample' },
  {
    component: ReanimatedOnPageScrollExample,
    name: 'Reanimated onPageScroll example',
  },
  { component: CoverflowExample, name: 'CoverflowExample' },
];

function App() {
  const navigation = useNavigation();
  return (
    <ScrollView>
      {examples.map((example) => (
        <TouchableOpacity
          key={example.name}
          testID={example.name}
          style={styles.exampleTouchable}
          onPress={() => {
            //@ts-ignore
            navigation.navigate(example.name);
          }}
        >
          <Text style={styles.exampleText}>{example.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const Stack = createStackNavigator();

const NativeStack = createNativeStackNavigator();

export function Navigation() {
  const [mode, setMode] = React.useState<'native' | 'js'>('js');
  const NavigationStack = mode === 'js' ? Stack : NativeStack;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <NavigationStack.Navigator initialRouteName="PagerView Example">
            <NavigationStack.Screen
              name="PagerView Example"
              component={App}
              options={{
                headerRight: () => (
                  <Button
                    onPress={() =>
                      Alert.alert(
                        'Alert',
                        `Do you want to change to the ${
                          mode === 'js' ? 'native stack' : 'js stack'
                        } ?`,
                        [
                          { text: 'No', onPress: () => {} },
                          {
                            text: 'Yes',
                            onPress: () => {
                              setMode(mode === 'js' ? 'native' : 'js');
                            },
                          },
                        ]
                      )
                    }
                    title={mode === 'js' ? 'JS' : 'NATIVE'}
                    color="orange"
                  />
                ),
                headerLeft: () => (
                  <Button
                    title={I18nManager.getConstants().isRTL ? 'RTL' : 'LTR'}
                    color="orange"
                    onPress={() => {
                      I18nManager.forceRTL(!I18nManager.getConstants().isRTL);
                      DevSettings.reload();
                    }}
                  />
                ),
              }}
            />
            {examples.map((example, index) => (
              <NavigationStack.Screen
                key={index}
                name={example.name}
                component={example.component}
              />
            ))}
          </NavigationStack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  exampleTouchable: {
    padding: 16,
  },
  exampleText: {
    fontSize: 16,
  },
});
