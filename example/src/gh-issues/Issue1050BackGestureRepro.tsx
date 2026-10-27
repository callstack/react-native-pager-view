/**
 * Repro for #1050: a horizontal pager on a stack screen. On iOS 26 a back
 * swipe started mid-screen on page 0 should close the screen and return to the
 * example list; on later pages it should change the page.
 *
 * The nested variant puts the same screen on the root of a native stack that
 * is itself a screen of the app's stack. The inner stack can't go back, the
 * outer one can, and the back swipe should still close the screen.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PagerView from 'react-native-pager-view';

const InnerStack = createNativeStackNavigator();

export function Issue1050BackGestureRepro() {
  const [selectedPage, setSelectedPage] = useState(0);

  return (
    <View style={styles.container}>
      <Text testID="issue-1050-status" style={styles.status}>
        {`Selected: ${selectedPage}`}
      </Text>
      <PagerView
        testID="issue-1050-pager"
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setSelectedPage(e.nativeEvent.position)}
      >
        {[0, 1, 2].map((page) => (
          <View key={page} style={styles.page}>
            <Text style={styles.label}>{`Page ${page}`}</Text>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

export function Issue1050NestedStackBackGestureRepro() {
  return (
    <InnerStack.Navigator screenOptions={{ headerShown: false }}>
      <InnerStack.Screen
        name="Issue1050InnerRoot"
        component={Issue1050BackGestureRepro}
      />
    </InnerStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  status: { padding: 16, fontSize: 16 },
  pager: { flex: 1 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 24 },
});
