import PagerView, { usePagerView } from 'react-native-pager-view';
import React from 'react';
import { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { PAGES, createPage } from './utils';
import { Text } from 'react-native';

const Item = () => {
  const {
    page,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageWithoutAnimation,
    setScrollEnabled,
  } = usePagerView();

  return (
    <View style={styles.content}>
      <Text>Current Page: {page}</Text>
      <Text>hasNextPage: {String(hasNextPage)}</Text>
      <Text>hasPreviousPage: {String(hasPreviousPage)}</Text>
      <Button
        title="next page"
        onPress={() => {
          if (hasNextPage) {
            setPage(page + 1);
          }
        }}
      />
      <Button
        title="prev page"
        onPress={() => {
          if (hasPreviousPage) {
            setPage(page - 1);
          }
        }}
      />

      <Button
        title="next page without animation"
        onPress={() => {
          setPageWithoutAnimation(page + 1);
        }}
      />

      <Button
        title="setScrollEnabled to true"
        onPress={() => {
          setScrollEnabled(true);
        }}
      />

      <Button
        title="setScrollEnabled to false"
        onPress={() => {
          setScrollEnabled(false);
        }}
      />
    </View>
  );
};

export const UsePagerViewExample = (): JSX.Element => {
  const [pages] = useState(
    Array(PAGES)
      .fill(1)
      .map((_, index) => createPage(index))
  );

  return (
    <PagerView testID="pager-view" style={styles.flex}>
      {pages.map((page) => (
        <Item key={page.key} />
      ))}
    </PagerView>
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
