/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

'use strict';

import React from 'react';
import { Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View, 
  SafeAreaView,
  Platform } from 'react-native' 

import ViewPagerAndroid from '@react-native-community/viewpager';
import { PAGES, BGCOLOR, IMAGE_URIS, createPage } from "./Common";
import { Button } from "./src/component/Button";
import { LikeCount } from "./src/component/LikeCount";
import { ProgressBar } from "./src/component/ProgressBar";

export default class ViewPagerExample extends React.Component {
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
      progress: {
        position: 0,
        offset: 0,
      },
      pages
    };
  };

  onPageSelected = e => {
    this.setState({page: e.nativeEvent.position});
  };

  onPageScroll = e => {
    this.setState({progress: e.nativeEvent});
  };

  onPageScrollStateChanged = e => {
    this.setState({scrollState: e.nativeEvent.pageScrollState});
  };

  addPage = e => {
    this.setState(prevState => ({ pages: [...prevState.pages, this.createPage(prevState.pages.length)]}));
  }

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
        <LikeCount />
      </View>
    );
  };

  render() {
    const {page, pages, animationsAreEnabled} = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <ViewPagerAndroid
          style={styles.viewPager}
          initialPage={0}
          scrollEnabled={this.state.scrollEnabled}
          onPageScroll={this.onPageScroll}
          onPageSelected={this.onPageSelected}
          onPageScrollStateChanged={this.onPageScrollStateChanged}
          pageMargin={10}
          ref={viewPager => {
            this.viewPager = viewPager;
          }}>
          { pages.map( page => this.renderPage(page)) }
        </ViewPagerAndroid>
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
          <Button enabled={true} text="Add new page" onPress={this.addPage} />
        </View>
        <View style={styles.buttons}>
          {animationsAreEnabled ? (
            <Button
              text="Turn off animations"
              enabled={true}
              onPress={() => this.setState({animationsAreEnabled: false})}
            />
          ) : (
            <Button
              text="Turn animations back on"
              enabled={true}
              onPress={() => this.setState({animationsAreEnabled: true})}
            />
          )}
          <Text style={styles.scrollStateText}>
            ScrollState[ {this.state.scrollState} ]
          </Text>
        </View>
        <View style={styles.buttons}>
          <Button text="Start" enabled={page > 0} onPress={() => this.go(0)} />
          <Button
            text="Prev"
            enabled={page > 0}
            onPress={() => this.move(-1)}
          />
          <Button
            text="Next"
            enabled={page < pages.length - 1}
            onPress={() => this.move(1)}
          />
          <Button
            text="Last"
            enabled={page < pages.length - 1}
            onPress={() => this.go(pages.length - 1)}
          />
        </View>
        <View style={styles.progress}>
          <Text style={styles.buttonText}> Page {page + 1} / {pages.length} </Text>
          <ProgressBar numberOfPages={pages.length} size={300} progress={this.state.progress} /> 
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progress: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'white',
  },
  scrollStateText: {
    color: '#99d1b7',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
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
