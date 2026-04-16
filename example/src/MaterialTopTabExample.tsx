import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

const DATA = Array.from({ length: 50 }, (_, i) => ({
  id: String(i),
  title: `Item ${i + 1}`,
}));

function ScrollableTab({ name, color }: { name: string; color: string }) {
  return (
    <FlatList
      data={DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.item, { backgroundColor: color }]}>
          <Text style={styles.itemText}>
            {name} - {item.title}
          </Text>
        </View>
      )}
    />
  );
}

function Tab1() {
  return <ScrollableTab name="Tab 1" color="#ff6b6b" />;
}

function Tab2() {
  return <ScrollableTab name="Tab 2" color="#4ecdc4" />;
}

function Tab3() {
  return <ScrollableTab name="Tab 3" color="#45b7d1" />;
}

function Tab4() {
  return <ScrollableTab name="Tab 4" color="#96ceb4" />;
}

const PreAuthScreen = (props: any) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Login" onPress={() => props.setIsSignedIn(true)} />
    </View>
  );
};

const PostAuthScreen = (props: any) => {
  const { Navigator, Screen } = createMaterialTopTabNavigator();

  return (
    <View style={{ flex: 1 }}>
      <Navigator>
        <Screen name="Tab1" component={Tab1} />
        <Screen name="Tab2" component={Tab2} />
        <Screen name="Tab3" component={Tab3} />
        <Screen name="Tab4" component={Tab4} />
      </Navigator>
    </View>
  );
};

export function MaterialTopBarExample() {
  const { Screen, Navigator } = createNativeStackNavigator();
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <Navigator>
      {!isSignedIn ? (
        <Screen name="Pre Auth Screen">
          {(props: any) => (
            <PreAuthScreen {...props} setIsSignedIn={setIsSignedIn} />
          )}
        </Screen>
      ) : (
        <Screen name="Post Auth Screen">
          {(props: any) => (
            <PostAuthScreen {...props} setIsSignedIn={setIsSignedIn} />
          )}
        </Screen>
      )}
    </Navigator>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    marginVertical: 2,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
