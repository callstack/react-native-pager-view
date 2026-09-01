import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

const listItems = Array.from({ length: 50 }, (_, index) => `List item ${index}`);

function Tab1(props: { onOpenDetail: () => void }) {
  const listRef = React.useRef<FlatList<string>>(null);

  return (
    <View testID="material-top-bar-tab-1" style={styles.tab}>
      <Text testID="material-top-bar-tab-1-text">Tab 1</Text>
      <Button
        testID="material-top-bar-scroll-list-button"
        title="Scroll list"
        onPress={() => listRef.current?.scrollToIndex({ index: 30 })}
      />
      <Button
        testID="material-top-bar-open-detail-button"
        title="Open detail"
        onPress={props.onOpenDetail}
      />
      <FlatList
        ref={listRef}
        testID="material-top-bar-list"
        data={listItems}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => (
          <Text testID={`material-top-bar-list-item-${index}`} style={styles.row}>
            {item}
          </Text>
        )}
      />
    </View>
  );
}

function Tab2(props: any) {
  return (
    <View
      testID="material-top-bar-tab-2"
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Button
        testID="material-top-bar-logout-button"
        title="Logout"
        onPress={props.onLogout}
      />
    </View>
  );
}

const PreAuthScreen = (props: any) => {
  return (
    <View
      testID="material-top-bar-pre-auth-screen"
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Button
        testID="material-top-bar-login-button"
        title="Login"
        onPress={() => props.setIsSignedIn(true)}
      />
    </View>
  );
};

const PostAuthScreen = (props: any) => {
  const { Navigator, Screen } = createMaterialTopTabNavigator();
  const onLogout = () => {
    setTimeout(() => {
      props.setIsSignedIn(false);
    }, 0);
  };

  return (
    <View testID="material-top-bar-post-auth-screen" style={{ flex: 1 }}>
      <Navigator>
        <Screen name="Tab1">
          {() => <Tab1 onOpenDetail={props.onOpenDetail} />}
        </Screen>
        <Screen name="Tab2">
          {(props: any) => <Tab2 {...props} onLogout={onLogout} />}
        </Screen>
      </Navigator>
    </View>
  );
};

const DetailScreen = () => (
  <View testID="material-top-bar-detail-screen" style={styles.centered}>
    <Text>Detail screen</Text>
  </View>
);

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
            <PostAuthScreen
              {...props}
              setIsSignedIn={setIsSignedIn}
              onOpenDetail={() => props.navigation.navigate('Detail Screen')}
            />
          )}
        </Screen>
      )}
      <Screen name="Detail Screen" component={DetailScreen} />
    </Navigator>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    height: 48,
    padding: 12,
  },
});
