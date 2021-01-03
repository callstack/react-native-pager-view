import ViewPager from '@react-native-community/viewpager';
import React from 'react';
import { ScrollView, View, Image, StyleSheet, Animated } from 'react-native';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';

const HEIGHT = 300;

const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);

export const ScrollableViewPagerExample = (): JSX.Element => {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <>
      <ScrollView style={styles.flex}>
        {navigationPanel.pages.map(({ key }) => (
          <AnimatedViewPager
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
          </AnimatedViewPager>
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
