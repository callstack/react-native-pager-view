import * as React from 'react';
import { View, useWindowDimensions, Text, ScrollView } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { Header } from 'react-native/Libraries/NewAppScreen';

function FirstRoute() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: 'blue' }}>
      <Text style={{color: 'white'}}>First Route</Text>
    </View>
  );
}

function SecondRoute() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: 'purple' }}>
      <Text style={{color: 'white'}}>Second Route</Text>
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
      contentContainerStyle={{flexGrow: 1, backgroundColor: 'red'}}
      nestedScrollEnabled={false}
      scrollEnabled={true}
    >
      <Header />

      <View>
        <TabView
          style={{height: 1200}}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      </View>
    </ScrollView>
  );
}