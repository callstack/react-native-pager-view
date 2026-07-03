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
import { NestedPagerView } from './NestedPagerView';
import TabBarIconExample from './tabView/TabBarIconExample';
import CustomTabBarExample from './tabView/CustomTabBarExample';
import CoverflowExample from './tabView/CoverflowExample';
import { TabViewInsideScrollViewExample } from './tabView/TabViewInsideScrollViewExample';
import ReanimatedOnPageScrollExample from './ReanimatedOnPageScrollExample';
import { MaterialTopBarExample } from './MaterialTopTabExample';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PagerHookExample } from './PagerHookExample';
import { NestedHorizontalScrollViewExample } from './NestedHorizontalScrollViewExample';

function BasicPagerViewExampleScreen() {
  return <BasicPagerViewExample isHorizontal={true} />;
}

function VerticalBasicPagerViewExampleScreen() {
  return <BasicPagerViewExample isHorizontal={false} />;
}

const examples = [
  {
    component: BasicPagerViewExampleScreen,
    name: 'Basic Example',
  },
  {
    component: VerticalBasicPagerViewExampleScreen,
    name: 'Vertical Basic Example',
  },

  { component: OnPageScrollExample, name: 'OnPageScroll Example' },
  { component: OnPageSelectedExample, name: 'OnPageSelected Example' },

  {
    component: ScrollablePagerViewExample,
    name: 'Scrollable PagerView Example',
  },
  {
    component: NestedPagerView,
    name: 'Nested PagerView Example',
  },
  {
    component: NestedHorizontalScrollViewExample,
    name: 'NestedHorizontalScrollViewExample',
  },

  {
    component: ScrollViewInsideExample,
    name: 'ScrollView inside PagerView Example',
  },

  {
    component: TabViewInsideScrollViewExample,
    name: 'TabView inside ScrollView Example',
  },
];

const tabViewExamples = [
  { component: MaterialTopBarExample, name: 'MaterialTopBarExample' },
  { component: TabBarIconExample, name: 'TabBarIconExample' },
  { component: CustomTabBarExample, name: 'CustomTabBarExample' },
  { component: CoverflowExample, name: 'CoverflowExample' },
];

const additionalExamples = [
  { component: PagerHookExample, name: 'Pager Hook Example' },
  { component: KeyboardExample, name: 'Keyboard Example' },
  { component: HeadphonesCarouselExample, name: 'Headphones Carousel Example' },
  { component: PaginationDotsExample, name: 'Pagination Dots Example' },
  {
    component: ReanimatedOnPageScrollExample,
    name: 'Reanimated onPageScroll example',
  },
];

const allExamples = [...examples, ...tabViewExamples, ...additionalExamples];

function App() {
  const navigation = useNavigation();
  return (
    <ScrollView>
      <Text>Fundamental Examples</Text>
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
      <Text>TabView Examples</Text>
      {tabViewExamples.map((example) => (
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
      <Text>Additional Examples</Text>
      {additionalExamples.map((example) => (
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
  const [mode, setMode] = React.useState<'native' | 'js'>('native');
  const NavigationStack = mode === 'js' ? Stack : NativeStack;
  return (
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
          {allExamples.map((example, index) => (
            <NavigationStack.Screen
              key={index}
              name={example.name}
              component={example.component}
            />
          ))}
        </NavigationStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
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
