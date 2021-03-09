import PagerView from 'react-native-pager-view';
import React from 'react';
import { ScrollView, View, Image, StyleSheet, Animated } from 'react-native';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';

const HEIGHT = 300;

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export const ScrollablePagerViewExample = (): JSX.Element => {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <>
      <ScrollView style={styles.flex}>
        {navigationPanel.pages.map(({ key }) => (
          <AnimatedPagerView
            {...navigationPanel}
            ref={ref}
            key={key}
            style={{ height: HEIGHT }}
          >
            {navigationPanel.pages.map((page) => (
              <View key={`${key}+${page.key}`} style={styles.content}>
                <Image style={styles.flex} source={page.imgSource} />
              </View>
            ))}
          </AnimatedPagerView>
        ))}
      </ScrollView>
      <NavigationPanel {...navigationPanel} />
    </>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginVertical: 10,
  },
});
