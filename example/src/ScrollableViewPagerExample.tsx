import React from 'react';
import { ScrollView, View, Image, StyleSheet } from 'react-native';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import { AnimatedViewPager } from './utils';

const HEIGHT = 300;

export const ScrollableViewPagerExample = (): JSX.Element => {
  const { ref, ...navigationPanel } = useNavigationPanel();

  return (
    <>
      <ScrollView style={styles.flex}>
        {navigationPanel.pages.map(({ key }) => (
          <AnimatedViewPager
            ref={ref}
            data={navigationPanel.pages}
            key={key}
            style={{ height: HEIGHT }}
            keyExtractor={(page) => `${key}+${page.key}`}
            renderItem={({ item }) => (
              <View style={styles.content}>
                <Image style={styles.flex} source={item.imgSource} />
              </View>
            )}
          />
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
