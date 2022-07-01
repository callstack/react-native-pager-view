import * as React from 'react';
import { StyleSheet } from 'react-native';
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
};

type State = NavigationState<Route>;

export default class TabBarIconExample extends React.Component<{}, State> {
  // eslint-disable-next-line react/sort-comp
  static title = 'Top tab bar with icons';
  static backgroundColor = '#e91e63';
  static appbarElevation = 0;

  state: State = {
    index: 0,
    routes: [{ key: 'chat' }, { key: 'contacts' }, { key: 'article' }],
  };

  private handleIndexChange = (index: number) =>
    this.setState({
      index,
    });

  private renderIcon = () => null;

  private renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={styles.indicator}
        renderIcon={this.renderIcon}
        style={styles.tabbar}
      />
    );
  };

  private renderScene = SceneMap({
    chat: Chat,
    contacts: Contacts,
    article: Article,
  });

  render() {
    return (
      <TabView
        lazy
        navigationState={this.state}
        renderScene={this.renderScene}
        renderTabBar={this.renderTabBar}
        onIndexChange={this.handleIndexChange}
      />
    );
  }
}

const styles = StyleSheet.create({
  tabbar: {
    backgroundColor: '#e91e63',
  },
  indicator: {
    backgroundColor: '#ffeb3b',
  },
});
