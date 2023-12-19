import PagerView, { usePager } from 'react-native-pager-view';
import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Text } from 'react-native';

const NonHookComponent = () => {
  console.log('rerender <NonHookComponent />');

  return (
    <View style={styles.content}>
      <Text>HasNotHook</Text>
    </View>
  );
};

const HookComponent = ({ index }: { index: number }) => {
  const {
    page,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageWithoutAnimation,
    setScrollEnabled,
  } = usePager();

  console.log(`rerender <HookComponent index={${index}} />`);

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

export const UsePagerExample = (): JSX.Element => {
  return (
    <PagerView testID="pager-view" style={styles.flex}>
      <HookComponent index={1} />
      <HookComponent index={2} />
      <HookComponent index={3} />
      <NonHookComponent />
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
