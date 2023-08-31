import PagerView from 'react-native-pager-view';
import React from 'react';
import { ScrollView, View, Image, StyleSheet, Animated } from 'react-native';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEIGHT = 300;

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export function ScrollablePagerViewExample() {
  const { ref, ...navigationPanel } = useNavigationPanel();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={'container'}
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ScrollView testID={'scroll-view'} style={styles.flex}>
        {navigationPanel.pages.map(({ key }) => (
          <AnimatedPagerView
            {...navigationPanel}
            testID={'pager-view'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginVertical: 10,
  },
});
