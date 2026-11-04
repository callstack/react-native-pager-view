/**
 * Repro for #1194: the Android pager restored a previous pager's page
 * instead of using initialPage. The pager's ComposeView saved its
 * rememberSaveable state in the host Fragment's SavedStateRegistry under a key
 * shared by every pager. Covering the screen with a native-stack push saves
 * that state, and the next pager mounted on the screen restored it.
 *
 * Steps: go to page 2, open the cover screen, come back, remount. The remounted
 * pager must start on page 1, its initialPage.
 */
import * as React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import PagerView, { type PagerViewRef } from 'react-native-pager-view';

export type PR1194RemountInitialPageParamList = {
  'PR #1194 Remount InitialPage Repro': undefined;
  'PR #1194 Remount InitialPage Cover': undefined;
};

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];

export function PR1194RemountInitialPageRepro() {
  const pagerRef = React.useRef<PagerViewRef>(null);
  const [mount, setMount] = React.useState({ key: 0, initialPage: 0 });
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        PR1194RemountInitialPageParamList,
        'PR #1194 Remount InitialPage Repro'
      >
    >();

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.controls}>
        <Text testID="pr-1194-label" style={styles.label}>
          Mount {mount.key}, initialPage {mount.initialPage}
        </Text>
        <Button
          testID="pr-1194-go-to-2"
          title="Go to page 2"
          onPress={() => pagerRef.current?.setPage(2)}
        />
        <Button
          testID="pr-1194-open-cover"
          title="Open cover screen"
          onPress={() =>
            navigation.navigate('PR #1194 Remount InitialPage Cover')
          }
        />
        <Button
          testID="pr-1194-remount"
          title="Remount with initialPage 1"
          onPress={() =>
            setMount(({ key }) => ({ key: key + 1, initialPage: 1 }))
          }
        />
      </View>
      <PagerView
        key={mount.key}
        ref={pagerRef}
        style={styles.flex}
        initialPage={mount.initialPage}
      >
        {PAGES.map((label, i) => (
          <View
            key={label}
            testID={`pr-1194-page-${i}`}
            style={[styles.page, { backgroundColor: PAGE_COLORS[i] }]}
          >
            <Text style={styles.pageLabel}>{label}</Text>
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
}

export function PR1194RemountInitialPageCoverScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.controls}>
        <Text style={styles.label}>Cover screen</Text>
        <Button
          testID="pr-1194-close-cover"
          title="Go back"
          onPress={() => navigation.goBack()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controls: { padding: 16, gap: 8 },
  label: { fontSize: 14, color: '#444' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageLabel: { fontSize: 32, fontWeight: '600' },
});
