import * as React from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
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
];

// const examples = [{ component: BasicPagerViewExample, name: 'Basic Example' }];

function App() {
  const navigation = useNavigation();
  return (
    <ScrollView>
      {examples.map((example) => (
        <TouchableOpacity
          key={example.name}
          style={styles.exampleTouchable}
          onPress={() => {
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

export function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PagerView Example">
        <Stack.Screen name="PagerView Example" component={App} />
        {examples.map((example, index) => (
          <Stack.Screen
            key={index}
            name={example.name}
            component={example.component}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
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
