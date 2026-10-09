import { enableScreens } from 'react-native-screens';
// run this before any screen render(usually in App.js)
enableScreens();

import * as React from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  Platform,
  Pressable,
  View,
  I18nManager,
  DevSettings,
  StatusBar,
} from 'react-native';
import {
  DefaultTheme,
  NavigationContainer,
  useNavigation,
  type Theme,
} from '@react-navigation/native';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PagerHookExample } from './PagerHookExample';
import { NestedHorizontalScrollViewExample } from './NestedHorizontalScrollViewExample';
import { Issue1096KeyboardShrinkRepro } from './gh-issues/Issue1096KeyboardShrinkRepro';
import { Issue1098NestedPagerRepro } from './gh-issues/Issue1098NestedPagerRepro';
import { Issue1099SafeAreaRepro } from './gh-issues/Issue1099SafeAreaRepro';
import {
  Issue1083ModalSetPageExample,
  ModalSetPageModalScreen,
} from './gh-issues/Issue1083ModalSetPageExample';
import {
  Issue1142PlainListScreen,
  Issue1142PagerListScreen,
  Issue1142SearchBarInsetRepro,
} from './gh-issues/Issue1142SearchBarInsetRepro';
import { colors, radius } from './theme';

function BasicPagerViewExampleScreen() {
  return <BasicPagerViewExample isHorizontal={true} />;
}

function VerticalBasicPagerViewExampleScreen() {
  return <BasicPagerViewExample isHorizontal={false} />;
}

type Example = {
  component: React.ComponentType;
  name: string;
  testID?: string;
};

const chevron =
  Platform.OS === 'ios' && I18nManager.getConstants().isRTL ? '‹' : '›';

const sections: { title: string; data: Example[] }[] = [
  {
    title: 'Fundamental Examples',
    data: [
      {
        component: BasicPagerViewExampleScreen,
        name: 'Basic Example',
        testID: 'example-basic-horizontal',
      },
      {
        component: VerticalBasicPagerViewExampleScreen,
        name: 'Vertical Basic Example',
        testID: 'example-basic-vertical',
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
    ],
  },
  {
    title: 'TabView Examples',
    data: [
      { component: MaterialTopBarExample, name: 'MaterialTopBarExample' },
      { component: TabBarIconExample, name: 'TabBarIconExample' },
      { component: CustomTabBarExample, name: 'CustomTabBarExample' },
      { component: CoverflowExample, name: 'CoverflowExample' },
      {
        component: TabViewInsideScrollViewExample,
        name: 'TabView inside ScrollView Example',
      },
    ],
  },
  {
    title: 'Additional Examples',
    data: [
      { component: PagerHookExample, name: 'Pager Hook Example' },
      { component: KeyboardExample, name: 'Keyboard Example' },
      {
        component: HeadphonesCarouselExample,
        name: 'Headphones Carousel Example',
      },
      { component: PaginationDotsExample, name: 'Pagination Dots Example' },
      {
        component: ReanimatedOnPageScrollExample,
        name: 'Reanimated onPageScroll example',
      },
    ],
  },
  {
    title: 'Github Issues Examples',
    data: [
      {
        component: Issue1083ModalSetPageExample,
        name: 'Issue #1083 Modal SetPage Repro',
      },
      {
        component: Issue1096KeyboardShrinkRepro,
        name: 'Issue #1096 Keyboard Shrink Repro',
      },
      {
        component: Issue1098NestedPagerRepro,
        name: 'Issue #1098 Nested Pager Repro',
      },
      {
        component: Issue1099SafeAreaRepro,
        name: 'Issue #1099 Safe Area Repro',
      },
      {
        component: Issue1142SearchBarInsetRepro,
        name: 'Issue #1142 Search Bar Inset Repro',
      },
    ],
  },
];

const allExamples = sections.flatMap((section) => section.data);

function App() {
  const navigation = useNavigation();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.card}>
            {section.data.map((example, index) => (
              <Pressable
                key={example.name}
                testID={example.testID ?? example.name}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && styles.rowDivider,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => {
                  //@ts-ignore
                  navigation.navigate(example.name);
                }}
              >
                <Text style={styles.rowText}>{example.name}</Text>
                <Text style={styles.chevron}>{chevron}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Flips the layout direction. The button reflects the pending direction right
 * away, so automation can wait for the flip before relaunching: the direction
 * itself only applies on the next launch in release builds, and killing the
 * app straight after the press can race I18nManager's async preference write.
 */
function LayoutDirectionToggle() {
  const [isRTL, setIsRTL] = React.useState(I18nManager.getConstants().isRTL);
  return (
    <Pressable
      testID={`layout-direction-${isRTL ? 'rtl' : 'ltr'}`}
      hitSlop={8}
      style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
      onPress={() => {
        const next = !I18nManager.getConstants().isRTL;
        I18nManager.forceRTL(next);
        setIsRTL(next);
        DevSettings.reload();
      }}
    >
      <Text style={styles.toggleText}>{isRTL ? 'RTL' : 'LTR'}</Text>
    </Pressable>
  );
}

const renderLayoutDirectionToggle = () => <LayoutDirectionToggle />;

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.foreground,
    border: colors.border,
  },
};

const NavigationStack = createNativeStackNavigator();

export function Navigation() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer theme={navigationTheme}>
          <NavigationStack.Navigator
            initialRouteName="PagerView Example"
            screenOptions={{
              headerShadowVisible: false,
              headerTintColor: colors.foreground,
              headerTitleStyle: { fontWeight: '600' },
              headerBackButtonDisplayMode: 'minimal',
            }}
          >
            <NavigationStack.Screen
              name="PagerView Example"
              component={App}
              options={{
                title: 'PagerView',
                headerLeft: renderLayoutDirectionToggle,
              }}
            />
            {allExamples.map((example, index) => (
              <NavigationStack.Screen
                key={index}
                name={example.name}
                component={example.component}
              />
            ))}
            <NavigationStack.Screen
              name="ModalSetPageModal"
              component={ModalSetPageModalScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <NavigationStack.Screen
              name="Issue #1142 Plain List"
              component={Issue1142PlainListScreen}
            />
            <NavigationStack.Screen
              name="Issue #1142 Pager List"
              component={Issue1142PagerListScreen}
            />
          </NavigationStack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    textAlign: 'left',
    paddingHorizontal: 4,
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.muted,
  },
  rowText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 15,
    color: colors.foreground,
  },
  chevron: {
    fontSize: 20,
    lineHeight: 20,
    color: colors.mutedForeground,
  },
  toggle: {
    paddingHorizontal: 6,
  },
  togglePressed: {
    opacity: 0.6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
});
