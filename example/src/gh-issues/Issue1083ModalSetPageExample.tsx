/**
 * Repro for #1083: setPage lands on the wrong index when called while the
 * pager is obscured by a presented native-stack modal on iOS.
 */
import * as React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import PagerView from 'react-native-pager-view';

export type ModalSetPageParamList = {
  'Issue #1083 Modal SetPage Repro': undefined;
  'ModalSetPageModal': { onSubmit: () => void };
};

const PAGES = ['Page 0', 'Page 1', 'Page 2'];
const PAGE_COLORS = ['#fde2e2', '#e2fde6', '#e2e8fd'];

export function Issue1083ModalSetPageExample() {
  const pagerRef = React.useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        ModalSetPageParamList,
        'Issue #1083 Modal SetPage Repro'
      >
    >();

  const advancePager = React.useCallback(() => {
    const next = (currentPage + 1) % PAGES.length;
    console.log('[setPage]', next);
    pagerRef.current?.setPage(next);
    setCurrentPage(next);
  }, [currentPage]);

  const openModal = React.useCallback(() => {
    navigation.navigate('ModalSetPageModal', { onSubmit: advancePager });
  }, [advancePager, navigation]);

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.controls}>
        <Text testID="issue-1083-requested-page" style={styles.label}>
          Last requested page: {currentPage}
        </Text>
        <Button title="Advance pager directly" onPress={advancePager} />
        <Button title="Open Modal" onPress={openModal} />
      </View>
      <PagerView ref={pagerRef} style={styles.flex}>
        {PAGES.map((label, i) => (
          <View
            key={label}
            testID={`issue-1083-page-${i}`}
            style={[styles.page, { backgroundColor: PAGE_COLORS[i] }]}
          >
            <Text style={styles.pageLabel}>{label}</Text>
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
}

export function ModalSetPageModalScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<ModalSetPageParamList, 'ModalSetPageModal'>
    >();
  const route =
    useRoute<RouteProp<ModalSetPageParamList, 'ModalSetPageModal'>>();

  const submit = React.useCallback(() => {
    // Intentionally synchronous: update the hidden pager, then dismiss.
    route.params.onSubmit();
    navigation.popTo('Issue #1083 Modal SetPage Repro');
  }, [navigation, route]);

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.controls}>
        <Text style={styles.label}>Modal screen</Text>
        <Button title="Submit & advance pager" onPress={submit} />
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
