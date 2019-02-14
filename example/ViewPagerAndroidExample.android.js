/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const React = require('react');
const ReactNative = require('react-native');
const {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} = ReactNative;
import ViewPagerAndroid from '@react-native-community/viewpager';

const PAGES = 5;
const BGCOLOR = ['#fdc08e', '#fff6b9', '#99d1b7', '#dde5fe', '#f79273'];
const IMAGE_URIS = [
  'https://apod.nasa.gov/apod/image/1410/20141008tleBaldridge001h990.jpg',
  'https://apod.nasa.gov/apod/image/1409/volcanicpillar_vetter_960.jpg',
  'https://apod.nasa.gov/apod/image/1409/m27_snyder_960.jpg',
  'https://apod.nasa.gov/apod/image/1409/PupAmulti_rot0.jpg',
  'https://apod.nasa.gov/apod/image/1510/lunareclipse_27Sep_beletskycrop4.jpg',
];

type Props = $ReadOnly<{||}>;
type State = {|likes: number|};
class LikeCount extends React.Component<Props, State> {
  state = {
    likes: 7,
  };

  onClick = () => {
    this.setState({likes: this.state.likes + 1});
  };

  render() {
    const thumbsUp = '\uD83D\uDC4D';
    return (
      <View style={styles.likeContainer}>
        <TouchableOpacity onPress={this.onClick} style={styles.likeButton}>
          <Text style={styles.likesText}>{thumbsUp + ' Like'}</Text>
        </TouchableOpacity>
        <Text style={styles.likesText}>{this.state.likes + ' likes'}</Text>
      </View>
    );
  }
}

class Button extends React.Component {
  _handlePress = () => {
    if (this.props.enabled && this.props.onPress) {
      this.props.onPress();
    }
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={this._handlePress}>
        <View
          style={[
            styles.button,
            this.props.enabled ? {} : styles.buttonDisabled,
          ]}>
          <Text style={styles.buttonText}>{this.props.text}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class ProgressBar extends React.Component {
  render() {
    const fractionalPosition =
      this.props.progress.position + this.props.progress.offset;
    const progressBarSize =
      (fractionalPosition / (this.props.numberOfPages - 1)) * this.props.size;
    return (
      <View style={[styles.progressBarContainer, {width: this.props.size}]}>
        <View style={[styles.progressBar, {width: progressBarSize}]} />
      </View>
    );
  }
}

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

    this.setState({page});
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
      <View style={styles.container}>
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
          <Button
            enabled={true}
            text="Add new page"
            onPress={this.addPage}
          />
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
          <Text style={styles.buttonText}>
            Page {page + 1} / {pages.length}
          </Text>
          <ProgressBar numberOfPages={pages.length} size={100} progress={this.state.progress} />
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    height: 30,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    width: 0,
    margin: 5,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'gray',
  },
  buttonDisabled: {
    backgroundColor: 'black',
    opacity: 0.5,
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
  likeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    flex: 1,
    margin: 8,
  },
  likeContainer: {
    flexDirection: 'row',
    height: 45,
  },
  likesText: {
    flex: 1,
    fontSize: 18,
    alignSelf: 'center',
  },
  progressBarContainer: {
    height: 10,
    margin: 10,
    borderColor: '#eeeeee',
    borderWidth: 2,
  },
  progressBar: {
    alignSelf: 'flex-start',
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  viewPager: {
    flex: 1,
  },
});
