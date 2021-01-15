import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ViewPager } from '@react-native-community/viewpager';

export default function App() {
  const data = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return (
    <ViewPager
      data={data}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={styles.text}>{item}</Text>}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { fontSize: 100 },
});
