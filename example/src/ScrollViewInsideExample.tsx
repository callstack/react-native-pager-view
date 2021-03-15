import { PagerView } from 'react-native-pager-view';
import React from 'react';
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { PAGES, createPage } from './utils';

export const ScrollViewInsideExample = (): JSX.Element => {
  const [pages] = useState(
    Array(PAGES)
      .fill(1)
      .map((_, index) => createPage(index))
  );

  return (
    <PagerView
      style={styles.flex}
      data={pages}
      keyExtractor={(page) => `${page.key}`}
      renderItem={({ item }) => (
        <ScrollView style={styles.content}>
          {Array(20)
            .fill(1)
            .map((_, index) => (
              <View key={`${item.key}_${index}`} style={styles.separator}>
                <Button
                  title="Click me"
                  onPress={() => {
                    console.log('Button Clicked');
                  }}
                />
              </View>
            ))}
        </ScrollView>
      )}
    />
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
  separator: {
    margin: 16,
  },
});
