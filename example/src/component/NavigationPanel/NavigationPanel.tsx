import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ControlsPanel } from './ControlPanel';
import { LogsPanel } from './LogsPanel';
import type { NavigationPanelProps } from './types';

enum VisibleTab {
  None,
  Logs,
  Controls,
}

export function NavigationPanel(props: NavigationPanelProps) {
  const [visible, setVisible] = useState(VisibleTab.Controls);

  return (
    <View>
      <View style={styles.toggleVisibilityButtonContainer}>
        <TouchableOpacity
          style={[
            styles.toggleVisibilityButton,
            visible === VisibleTab.Controls &&
              styles.toggleVisibilityButtonActive,
          ]}
          activeOpacity={0.8}
          onPress={() =>
            setVisible((prevVisible) =>
              prevVisible === VisibleTab.Controls
                ? VisibleTab.None
                : VisibleTab.Controls
            )
          }
        >
          <Text
            style={[
              styles.toggleVisibilityText,
              visible === VisibleTab.Controls &&
                styles.toggleVisibilityTextActive,
            ]}
          >
            Control
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleVisibilityButton,
            visible === VisibleTab.Logs && styles.toggleVisibilityButtonActive,
          ]}
          activeOpacity={0.8}
          onPress={() => {
            setVisible((prevVisible) =>
              prevVisible === VisibleTab.Logs
                ? VisibleTab.None
                : VisibleTab.Logs
            );
          }}
        >
          <Text
            style={[
              styles.toggleVisibilityText,
              visible === VisibleTab.Logs && styles.toggleVisibilityTextActive,
            ]}
          >
            Logs
          </Text>
        </TouchableOpacity>
      </View>
      {visible === VisibleTab.Controls ? <ControlsPanel {...props} /> : null}
      {visible === VisibleTab.Logs ? <LogsPanel logs={props.logs} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleVisibilityButtonContainer: {
    position: 'absolute',
    left: 8,
    bottom: '100%',
    flexDirection: 'row',
  },
  toggleVisibilityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  toggleVisibilityButtonActive: {
    backgroundColor: '#fff',
  },
  toggleVisibilityText: {
    color: '#fff',
    fontSize: 20,
  },
  toggleVisibilityTextActive: {
    color: '#000',
  },
});
