import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import type { LogsPanelProps } from './types';

export function LogsPanel({ logs }: LogsPanelProps) {
  console.log(logs);
  return (
    <FlatList
      style={styles.container}
      data={logs}
      renderItem={({ item }) => (
        //@ts-ignore
        <View style={[styles.item, styles[item.event]]}>
          <Text style={styles.text}>
            {item.timestamp.toLocaleTimeString()}
            <Text style={styles.eventName}>
              {' | '}
              {item.event.toLocaleUpperCase()}
            </Text>
          </Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    height: 250,
  },
  item: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  scroll: {
    backgroundColor: 'cyan',
  },
  select: {
    backgroundColor: 'greenyellow',
  },
  statusChanged: {
    backgroundColor: 'tomato',
  },
  text: {
    color: '#000',
  },
  eventName: {
    color: '#595959',
  },
});
