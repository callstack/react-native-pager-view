import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { ControlsPanel } from './ControlPanel';
import { LogsPanel } from './LogsPanel';
import type { NavigationPanelProps } from './types';
import { colors, radius } from '../../theme';

enum VisibleTab {
  None,
  Logs,
  Controls,
}

const tabs = [
  { tab: VisibleTab.Controls, label: 'Control' },
  { tab: VisibleTab.Logs, label: 'Logs' },
];

export function NavigationPanel(props: NavigationPanelProps) {
  const [visible, setVisible] = useState(VisibleTab.Controls);

  return (
    <View style={styles.container}>
      <View style={styles.tabList}>
        {tabs.map(({ tab, label }) => {
          const isActive = visible === tab;
          return (
            <Pressable
              key={label}
              style={[styles.tabTrigger, isActive && styles.tabTriggerActive]}
              onPress={() =>
                setVisible((prevVisible) =>
                  prevVisible === tab ? VisibleTab.None : tab
                )
              }
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {visible === VisibleTab.Controls ? <ControlsPanel {...props} /> : null}
      {visible === VisibleTab.Logs ? (
        <LogsPanel logs={props.logs ?? []} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabList: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    margin: 12,
    padding: 3,
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
  },
  tabTrigger: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.md - 1,
  },
  tabTriggerActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.foreground,
  },
});
