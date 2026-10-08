import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import type { LogsPanelProps } from './types';
import type { EventLog } from '../../hook/useNavigationPanel';
import { colors, radius } from '../../theme';

const eventColors: Record<EventLog['event'], string> = {
  scroll: '#e0f2fe',
  select: '#dcfce7',
  statusChanged: '#fef3c7',
};

export function LogsPanel({ logs }: LogsPanelProps) {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={logs}
      ListEmptyComponent={
        <Text style={styles.empty}>Swipe the pager to see events.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.meta}>
            <View
              style={[
                styles.badge,
                { backgroundColor: eventColors[item.event] },
              ]}
            >
              <Text style={styles.badgeText}>{item.event}</Text>
            </View>
            <Text style={styles.time}>
              {item.timestamp.toLocaleTimeString()}
            </Text>
          </View>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  time: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  text: {
    fontSize: 12,
    color: colors.foreground,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 13,
    color: colors.mutedForeground,
  },
});
