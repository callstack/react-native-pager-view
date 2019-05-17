/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */
import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native' 
import ViewPagerAndroid from '@react-native-community/viewpager';
import { NativeModules } from 'react-native';


const PAGES = 5;
const BGCOLOR = ['#fdc08e', '#fff6b9', '#99d1b7', '#dde5fe', '#f79273'];
const IMAGE_URIS = [
  'https://apod.nasa.gov/apod/image/1410/20141008tleBaldridge001h990.jpg',
  'https://apod.nasa.gov/apod/image/1409/volcanicpillar_vetter_960.jpg',
  'https://apod.nasa.gov/apod/image/1409/m27_snyder_960.jpg',
  'https://apod.nasa.gov/apod/image/1409/PupAmulti_rot0.jpg',
  'https://apod.nasa.gov/apod/image/1510/lunareclipse_27Sep_beletskycrop4.jpg',
];

export default class ViewPagerAndroidExample extends React.Component {

  constructor(props) {
    super(props);

    const pages = [];
    for (let i = 0; i < PAGES; i++) {
      pages.push(this.createPage(i));
    }
    
    this.state = {
      page: 0,
      animationsAreEnabled: true,
      scrollEnabled: true,
      position: 0,
      pages
    };
  };

  createPage(key) {
    return {
      key: key,
      style: {
        backgroundColor: BGCOLOR[key % BGCOLOR.length],
        alignItems: 'center',
        padding: 20,
      }, 
      imgSource: { uri: IMAGE_URIS[key % BGCOLOR.length] }
    }
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
          onPageScroll={this.onPageScroll}
          pageMargin={50}>
          { pages.map( page => this.renderPage(page)) }
        </ViewPagerAndroid>
        <View style={styles.buttons}>
        <Button title="Previous" onPress={this.previous}/>
        <Button title="Next" onPress={this.next}/>
        </View>
        <View style={styles.buttons}>
        <Button
            title={
              this.state.scrollEnabled ? 'Scroll Enabled' : 'Scroll Disabled'
            }
            onPress={() =>
              this.setState({scrollEnabled: !this.state.scrollEnabled})
            }
          />
        </View>
        </View>);
  }

  onPageScroll = e => {
    this.setState({position: e.nativeEvent.position});
  };

  next = () => {
    NativeModules.RNCViewPager.goToNextPage();
  }

  previous = () => {
    NativeModules.RNCViewPager.goToPreviousPage();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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