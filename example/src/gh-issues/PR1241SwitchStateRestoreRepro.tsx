/**
 * Repro for #1241: on Android, a page that came back into the composition got
 * the old state of its native views. Compose's AndroidView saves its view's
 * hierarchy state when the page leaves the composition, past
 * beyondViewportPageCount, and restores it when the page comes back. A Switch
 * whose value React changed meanwhile was set back to the old value and
 * emitted onValueChange, as if the user had toggled it.
 *
 * Steps: show page 2, go to page 0 so page 2 leaves the composition, turn the
 * switch on from the button above the pager, go back to page 2. The switch
 * must stay on and onValueChange must not fire.
 */
import * as React from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];

export function PR1241SwitchStateRestoreRepro() {
  const pagerRef = React.useRef<PagerViewRef>(null);
  const [value, setValue] = React.useState(false);
  const [changes, setChanges] = React.useState(0);

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.controls}>
        <Text testID="pr-1241-status" style={styles.label}>
          {`value: ${value ? 'on' : 'off'} | changes: ${changes}`}
        </Text>
        <Button
          testID="pr-1241-go-to-0"
          title="Go to page 0"
          onPress={() => pagerRef.current?.setPageWithoutAnimation(0)}
        />
        <Button
          testID="pr-1241-go-to-2"
          title="Go to page 2"
          onPress={() => pagerRef.current?.setPageWithoutAnimation(2)}
        />
        <Button
          testID="pr-1241-turn-on"
          title="Turn the switch on"
          onPress={() => setValue(true)}
        />
      </View>
      <PagerView ref={pagerRef} style={styles.flex} initialPage={0}>
        {PAGES.map((label, i) => (
          <View
            key={label}
            testID={`pr-1241-page-${i}`}
            style={[styles.page, { backgroundColor: PAGE_COLORS[i] }]}
          >
            <Text style={styles.pageLabel}>{label}</Text>
            {i === 2 && (
              <Switch
                testID="pr-1241-switch"
                value={value}
                onValueChange={(next) => {
                  setChanges((count) => count + 1);
                  setValue(next);
                }}
              />
            )}
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controls: { padding: 16, gap: 8 },
  label: { fontSize: 14, color: '#444' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  pageLabel: { fontSize: 32, fontWeight: '600' },
});
