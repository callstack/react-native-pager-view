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
            <View style={{backgroundColor: "blue", width: "100%", height: "100%"}}></View>
      </View>
    );
  };

  renderPage2() {
    return (
      <View style={styles.container}>
          <View style={{backgroundColor: "yellow", width: "100%", height: "100%"}}></View>
      </View>
    );
  };

  renderPage3() {
    return (
      <View style={styles.container}>
          <View style={{backgroundColor: "black", width: "100%", height: "100%"}}></View>
      </View>
    );
  };

  render() {
    return (
      <ViewPagerAndroid style={{ flex:1, backgroundColor: "orange" }}>
      {this.renderPage()}
      {this.renderPage2()}
      {this.renderPage3()}
    </ViewPagerAndroid>);
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "pink"
  }
});
