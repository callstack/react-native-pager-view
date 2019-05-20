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
          onPageScroll={this.onPageScroll}
          pageMargin={50}
          ref={viewPager => {
            this.viewPager = viewPager;
          }}>
          { pages.map( page => this.renderPage(page)) }
        </ViewPagerAndroid>
        <View style={styles.buttons}>
        <Button
            enabled={true}
            text="Previous"
            onPress={() => this.move(-1)}
          />
      <Button
            enabled={true}
            text="Next"
            onPress={() => this.move(+1)}
          />
        </View>
        <View style={styles.buttons}>
        <Button
            enabled={true}
            text={
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
    this.setState({page: e.nativeEvent.position});
  };

  move = delta => {
    const page = this.state.page + delta;
    this.go(page);
  };

  go = page => {
    if (this.state.animationsAreEnabled) {
      this.viewPager.setPage(page);
    } else {
      this.viewPager.setPageWithoutAnimation(page);
    }

    this.setState({page});
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