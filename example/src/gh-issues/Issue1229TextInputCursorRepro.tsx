/**
 * Repro for #1229: on Android, tapping the text of a focused TextInput on a
 * page must move the cursor, like it does outside the pager. A finger that
 * moves a little during the tap made the input lose the touch, unless the
 * input had enough text to scroll. The input above the pager is the control.
 */
import React, { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputSelectionChangeEvent,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const INPUTS = ['outside', 'single', 'multi'] as const;
type InputName = (typeof INPUTS)[number];

export function Issue1229TextInputCursorRepro() {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [selections, setSelections] = useState<Record<InputName, number>>({
    outside: -1,
    single: -1,
    multi: -1,
  });

  const inputProps = (name: InputName) => ({
    testID: `issue-1229-input-${name}`,
    defaultValue: 'abcdefghij',
    onSelectionChange: (e: TextInputSelectionChangeEvent) => {
      const start = e.nativeEvent.selection.start;
      setSelections((current) => ({ ...current, [name]: start }));
    },
  });

  return (
    <View style={styles.screen}>
      <Text testID="issue-1229-status" style={styles.status}>
        {INPUTS.map((name) => `${name}: ${selections[name]}`).join(' | ')}
      </Text>
      <Button
        testID="issue-1229-scroll-enabled"
        title={`scrollEnabled: ${String(scrollEnabled)}`}
        onPress={() => setScrollEnabled((current) => !current)}
      />
      <TextInput {...inputProps('outside')} style={styles.input} />
      <PagerView
        style={styles.pager}
        initialPage={0}
        scrollEnabled={scrollEnabled}
      >
        <View key="0" style={[styles.page, styles.page0]}>
          <Text style={styles.pageLabel}>Page 0</Text>
          <TextInput {...inputProps('single')} style={styles.input} />
          <TextInput
            {...inputProps('multi')}
            multiline
            style={[styles.input, styles.multiline]}
          />
        </View>
        <View key="1" style={[styles.page, styles.page1]}>
          <Text style={styles.pageLabel}>Page 1</Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  status: {
    padding: 12,
    fontSize: 16,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    padding: 24,
  },
  page0: {
    backgroundColor: '#e2e8fd',
  },
  page1: {
    backgroundColor: '#fdf3e2',
  },
  pageLabel: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    margin: 12,
    borderWidth: 1,
    borderColor: 'black',
    padding: 8,
    fontSize: 18,
    backgroundColor: 'white',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
