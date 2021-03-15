import { PagerView } from 'react-native-pager-view';
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import type { CreatePage } from './utils';

const HEIGHT = 300;

export const ScrollablePagerViewExample = (): JSX.Element => {
  const { ref, ...navigationPanel } = useNavigationPanel<CreatePage>();

  return (
    <>
      <ScrollView style={styles.flex}>
        {navigationPanel.pages.map(({ key }) => (
          <PagerView
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
