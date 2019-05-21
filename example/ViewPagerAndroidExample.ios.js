/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native' 
import ViewPagerAndroid from '@react-native-community/viewpager';
import {PAGES, BGCOLOR, IMAGE_URIS, createPage } from "./Common";
import { Button } from "./src/component/Button";

export default class ViewPagerAndroidExample extends React.Component {

  constructor(props) {
    super(props);

    const pages = [];
    for (let i = 0; i < PAGES; i++) {
      pages.push(createPage(i));
    }
    
    this.state = {
      page: 0,
      page2:0,
      animationsAreEnabled: true,
      scrollEnabled: true,
      position: 0,
      pages
    };
  };

  renderPage(page) {
    return (
      <View key={page.key} style={page.style} collapsable={false}>
        <Image
          style={styles.image}
          source={page.imgSource}
        />
      </View>
    );
  };

  render() {
    const {page, pages, animationsAreEnabled} = this.state;
    return (
      <View style={styles.container}>
        <ViewPagerAndroid
          style={styles.viewPager}
          initialPage={0}
          transitionStyle="scroll"
          orientation="horizontal"
          scrollEnabled={this.state.scrollEnabled}
          onPageSelected={this.onPageSelected}
          pageMargin={50}
          ref={viewPager => {
            this.viewPager = viewPager;
          }}>
          { pages.map( page => this.renderPage(page)) }
        </ViewPagerAndroid>
        <ViewPagerAndroid
          style={styles.viewPager}
          initialPage={0}
          transitionStyle="scroll"
          orientation="horizontal"
          pageMargin={50}
          onPageSelected={this.onPageSelected2}
          ref={viewPager2 => {
            this.viewPager2 = viewPager2;
          }}>
          { pages.map( page => this.renderPage(page)) }
        </ViewPagerAndroid>
        </View>);
  }

  onPageSelected = e => {
    console.log(`page ${e.nativeEvent.position}`)
    this.setState({page: e.nativeEvent.position});
  };
  
  onPageSelected2 = e => {
    console.log(`page2 ${e.nativeEvent.position}`)
    this.setState({page2: e.nativeEvent.position});
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 300,
    height: 200,
    padding: 20,
  },
  viewPager: {
    flex: 1,
  },
});