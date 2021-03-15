import * as React from 'react';

import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { PagerView } from 'react-native-pager-view';
import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';
import { CreatePage, createPageKeyExtractor } from './utils';

export const OnPageSelectedExample = () => {
  const callback = React.useCallback((position: number) => {
    Alert.alert('Hey', `You are on ${position + 1} page`);
  }, []);
  const { ref, ...navigationPanel } = useNavigationPanel<CreatePage>(
    10,
    callback
  );

  return (
    <SafeAreaView style={styles.flex}>
      <PagerView
        onPageSelected={navigationPanel.onPageSelected}
        ref={ref}
        style={styles.flex}
        data={navigationPanel.pages}
        keyExtractor={createPageKeyExtractor}
        renderItem={({ item, index }) => (
          <View style={[item.style, styles.center]}>
            <Text style={styles.text}>{`Page Index: ${index}`}</Text>
          </View>
        )}
      />
      <NavigationPanel {...navigationPanel} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 30,
  },
});
