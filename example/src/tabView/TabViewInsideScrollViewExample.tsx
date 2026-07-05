import * as React from 'react';
import {
  View,
  useWindowDimensions,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';

function FirstRoute() {
  return (
    <View testID="tab-view-first-route" style={styles.firstRoute}>
      <Text style={styles.routeText}>First Route</Text>
      <Text testID="tab-view-first-route-bottom" style={styles.routeText}>
        First Route Bottom
      </Text>
    </View>
  );
}

function SecondRoute() {
  return (
    <View testID="tab-view-second-route" style={styles.secondRoute}>
      <Text style={styles.routeText}>Second Route</Text>
      <Text testID="tab-view-second-route-bottom" style={styles.routeText}>
        Second Route Bottom
      </Text>
    </View>
  );
}

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

const routes = [
  { key: 'first', title: 'First' },
  { key: 'second', title: 'Second' },
];

export function TabViewInsideScrollViewExample() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  return (
    <ScrollView
      testID="tab-view-scroll-view"
      contentContainerStyle={styles.contentContainer}
      nestedScrollEnabled={false}
      scrollEnabled={true}
    >
      <View style={{width:"100%", height:300, backgroundColor:"purple"}} />

      <View>
        <TabView
          testID="tab-view"
          style={styles.tabView}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    backgroundColor: 'red',
  },
  tabView: {
    height: 1200,
  },
  firstRoute: {
    flex: 1,
    padding: 20,
    backgroundColor: 'blue',
    justifyContent: 'space-between',
  },
  secondRoute: {
    flex: 1,
    padding: 20,
    backgroundColor: 'purple',
    justifyContent: 'space-between',
  },
  routeText: {
    color: 'white',
  },
});
