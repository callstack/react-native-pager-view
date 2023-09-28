import * as React from 'react';
import {
  Animated,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TabView,
  SceneMap,
  NavigationState,
  SceneRendererProps,
} from 'react-native-tab-view';
import Albums from './Shared/Albums';
import Article from './Shared/Article';
import Chat from './Shared/Chat';
import Contacts from './Shared/Contacts';

type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const routes = [
  { key: 'contacts', title: 'Contacts' },
  { key: 'albums', title: 'Albums' },
  { key: 'article', title: 'Article' },
  { key: 'chat', title: 'Chat' },
];

export default function CustomTabBarExample() {
  const [index, setIndex] = React.useState(0);

  const insets = useSafeAreaInsets();

  const renderItem =
    ({
      navigationState,
      position,
    }: {
      navigationState: State;
      position: Animated.AnimatedInterpolation<number>;
    }) =>
    ({ route, index }: { route: Route; index: number }) => {
      const inputRange = navigationState.routes.map((_, i) => i);

      const activeOpacity = position.interpolate({
        inputRange,
        outputRange: inputRange.map((i: number) => (i === index ? 1 : 0)),
      });
      const inactiveOpacity = position.interpolate({
        inputRange,
        outputRange: inputRange.map((i: number) => (i === index ? 0 : 1)),
      });

      return (
        <View style={styles.tab}>
          <Animated.View style={[styles.item, { opacity: inactiveOpacity }]}>
            <View style={[styles.icon]} />
            <Text style={[styles.label, styles.inactive]}>{route.title}</Text>
          </Animated.View>
          <Animated.View
            style={[styles.item, styles.activeItem, { opacity: activeOpacity }]}
          >
            <View style={[styles.icon]} />
            <Text style={[styles.label, styles.active]}>{route.title}</Text>
          </Animated.View>
        </View>
      );
    };

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => (
    <View style={styles.tabbar}>
      {props.navigationState.routes.map((route: Route, index: number) => {
        return (
          <TouchableWithoutFeedback
            key={route.key}
            onPress={() => props.jumpTo(route.key)}
          >
            {renderItem(props)({ route, index })}
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );

  const renderScene = SceneMap({
    contacts: Contacts,
    albums: Albums,
    article: Article,
    chat: Chat,
  });

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        tabBarPosition="bottom"
        onIndexChange={setIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, .2)',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4.5,
  },
  activeItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  active: {
    color: '#0084ff',
  },
  inactive: {
    color: '#939393',
  },
  icon: {
    height: 26,
    width: 26,
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    marginBottom: 1.5,
    backgroundColor: 'transparent',
  },
});
