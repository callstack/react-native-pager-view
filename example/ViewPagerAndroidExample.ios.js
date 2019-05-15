/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native' 
import ViewPagerAndroid from '@react-native-community/viewpager';

export default class ViewPagerAndroidExample extends React.Component<{}> {
  
  renderPage() {
    return (
      <View style={styles.container}>
        <Text>Render Page</Text>
      </View>
    );
  };

  render() {
    return (
      <ViewPagerAndroid style={{ flex:1 }}>

    </ViewPagerAndroid>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
