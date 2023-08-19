import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TabView,
  TabBar,
  SceneMap,
  NavigationState,
  SceneRendererProps,
} from 'react-native-tab-view';
import Article from './Shared/Article';
import Chat from './Shared/Chat';
import Contacts from './Shared/Contacts';

type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const routes = [
  { key: 'chat', title: 'Chat' },
  { key: 'contacts', title: 'Contacts' },
  { key: 'article', title: 'Article' },
];

export default function TabBarIconExample() {
  const [index, setIndex] = React.useState(0);
  const insets = useSafeAreaInsets();

  const renderIcon = () => null;

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={styles.indicator}
        renderIcon={renderIcon}
        style={styles.tabbar}
      />
    );
  };

  const renderScene = SceneMap({
    chat: Chat,
    contacts: Contacts,
    article: Article,
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
        lazy
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    backgroundColor: '#e91e63',
  },
  indicator: {
    backgroundColor: '#ffeb3b',
  },
});
