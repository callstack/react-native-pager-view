import * as React from 'react';
import { Image, StyleSheet, Text, View, SafeAreaView } from 'react-native';

import PagerView from 'react-native-pager-view';
import { PAGES, createPage } from './utils';
import { LikeCount } from './component/LikeCount';
import type { CreatePage } from './utils';

import { Button } from './component/Button';
import { ProgressBar } from './component/ProgressBar';

type State = {
  page: number;
  animationsAreEnabled: boolean;
  scrollEnabled: boolean;
  progress: {
    position: number;
    offset: number;
  };
  pages: Array<CreatePage>;
  scrollState: any;
  dotsVisible: boolean;
};

class PaperExample extends React.Component<any, State> {
  viewPager = React.createRef<PagerView>();

  constructor(props: any) {
    super(props);

    const pages = [];
    for (let i = 0; i < PAGES; i++) {
      pages.push(createPage(i));
    }

    this.state = {
      page: 0,
      animationsAreEnabled: true,
      scrollEnabled: true,
      progress: {
        position: 0,
        offset: 0,
      },
      pages: pages,
      scrollState: 'idle',
      dotsVisible: false,
    };
  }

  onPageSelected = (e: any) => {
    this.setState({ page: e.nativeEvent.position });
  };

  onPageScroll = (e: any) => {
    this.setState({
      progress: {
        position: e.nativeEvent.position,
        offset: e.nativeEvent.offset,
      },
    });
  };

  onPageScrollStateChanged = (e: any) => {
    this.setState({ scrollState: e.nativeEvent.pageScrollState });
  };

  addPage = () => {
    this.setState((prevState) => ({
      pages: [...prevState.pages, createPage(prevState.pages.length)],
    }));
  };

  removeLastPage = () => {
    this.setState((prevState) => ({
      pages: prevState.pages.slice(0, prevState.pages.length - 1),
    }));
  };
  move = (delta: number) => {
    const page = this.state.page + delta;
    this.go(page);
  };

  go = (page: number) => {
    if (this.state.animationsAreEnabled) {
      this.viewPager?.current?.setPage(page);
    } else {
      this.viewPager?.current?.setPageWithoutAnimation(page);
    }
  };

  renderPage(page: CreatePage) {
    return (
      <View key={page.key} style={page.style} collapsable={false}>
        <Image style={styles.image} source={page.imgSource} />
        <LikeCount />
      </View>
    );
  }

  render() {
    const { page, pages, animationsAreEnabled } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <PagerView
          style={styles.viewPager}
          initialPage={0}
          scrollEnabled={this.state.scrollEnabled}
          onPageScroll={this.onPageScroll}
          onPageSelected={this.onPageSelected}
          onPageScrollStateChanged={this.onPageScrollStateChanged}
          pageMargin={10}
          orientation="horizontal"
          ref={this.viewPager}
        >
          {pages.map((p) => this.renderPage(p))}
        </PagerView>
        <View style={styles.buttons}>
          <Button
            text={
              this.state.scrollEnabled ? 'Scroll Enabled' : 'Scroll Disabled'
            }
            onPress={() =>
              this.setState({ scrollEnabled: !this.state.scrollEnabled })
            }
          />
          <Button text="Add new page" onPress={this.addPage} />
          <Button text="Remove last page" onPress={this.removeLastPage} />
        </View>
        <View style={styles.buttons}>
          {animationsAreEnabled ? (
            <Button
              text="Turn off animations"
              onPress={() => this.setState({ animationsAreEnabled: false })}
            />
          ) : (
            <Button
              text="Turn animations back on"
              onPress={() => this.setState({ animationsAreEnabled: true })}
            />
          )}
          <Text style={styles.scrollStateText}>
            ScrollState[ {this.state.scrollState} ]
          </Text>
        </View>
        <View style={styles.buttons}>
          <Button text="Start" onPress={() => this.go(0)} />
          <Button text="Prev" onPress={() => this.move(-1)} />
          <Button text="Next" onPress={() => this.move(1)} />
          <Button text="Last" onPress={() => this.go(pages.length - 1)} />
        </View>
        <View style={styles.progress}>
          <Text style={styles.buttonText}>
            {' '}
            Page {page + 1} / {pages.length}{' '}
          </Text>
          <ProgressBar
            numberOfPages={pages.length}
            progress={this.state.progress}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export { PaperExample };
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
