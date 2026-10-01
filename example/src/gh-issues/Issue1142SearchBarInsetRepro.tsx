/**
 * Repro for #1142 / #1140: a FlatList inside PagerView on a native-stack
 * screen with `headerSearchBarOptions` must pick up the same top and bottom
 * insets as the same list rendered without a pager.
 *
 * `contentInsetAdjustmentBehavior="automatic"` is the path under test. Do
 * not compensate with `useHeaderHeight()` padding — that hid the bug.
 *
 * https://github.com/iliapnmrv/react-native-pager-view-ios-searchbar-inset
 */
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
  type View as ViewType,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const ROWS = Array.from({ length: 40 }, (_, index) => `Row ${index + 1}`);

function useSearchHeader() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Items',
      ...(Platform.OS === 'ios'
        ? {
            headerSearchBarOptions: {
              placeholder: 'Search items',
              placement: 'stacked',
              hideWhenScrolling: false,
              hideNavigationBar: false,
              onChangeText: () => {},
            },
          }
        : null),
    });
  }, [navigation]);
}

function useWindowY() {
  const ref = useRef<ViewType>(null);
  const [y, setY] = useState<number | null>(null);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((_x, nextY) => {
      if (Number.isFinite(nextY)) {
        setY(nextY);
      }
    });
  }, []);

  return { ref, y, measure };
}

const renderRow: ListRenderItem<string> = ({ item }) => (
  <View style={styles.row}>
    <Text style={styles.rowText}>{item}</Text>
  </View>
);

function MeasuredList({ testIDPrefix }: { testIDPrefix: string }) {
  const headerHeight = useHeaderHeight();
  const firstRow = useWindowY();
  const bottomMarker = useWindowY();
  const measureFirstRow = firstRow.measure;
  const measureBottomMarker = bottomMarker.measure;

  useEffect(() => {
    const measure = () => {
      measureFirstRow();
      measureBottomMarker();
    };
    const frame = requestAnimationFrame(measure);
    const later = setTimeout(measure, 400);
    const settled = setTimeout(measure, 900);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(later);
      clearTimeout(settled);
    };
  }, [headerHeight, measureBottomMarker, measureFirstRow]);

  const windowHeight = Dimensions.get('window').height;
  const firstY = firstRow.y;
  const bottomY = bottomMarker.y;
  const measuring = firstY == null || bottomY == null || headerHeight <= 0;
  const topOk =
    !measuring && firstY >= headerHeight - 8 && firstY <= headerHeight + 28;
  const bottomOk =
    !measuring && bottomY > windowHeight * 0.82 && bottomY < windowHeight + 1;
  const verdict = measuring
    ? 'safe-area: measuring'
    : topOk && bottomOk
      ? 'safe-area: pass'
      : 'safe-area: fail';

  return (
    <View style={styles.listHost} testID={`${testIDPrefix}-list`}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={ROWS}
        keyExtractor={(item) => item}
        onLayout={() => {
          firstRow.measure();
          bottomMarker.measure();
        }}
        renderItem={(info) =>
          info.index === 0 ? (
            <View
              ref={firstRow.ref}
              onLayout={firstRow.measure}
              style={styles.row}
              testID={`${testIDPrefix}-first-row`}
              collapsable={false}
            >
              <Text style={styles.rowText}>{info.item}</Text>
            </View>
          ) : (
            renderRow(info)
          )
        }
      />
      <View
        ref={bottomMarker.ref}
        onLayout={bottomMarker.measure}
        pointerEvents="none"
        style={styles.bottomMarker}
        testID={`${testIDPrefix}-bottom-marker`}
        collapsable={false}
      />
      <Text
        testID={`${testIDPrefix}-verdict`}
        style={[styles.verdict, { top: Math.max(headerHeight, 8) + 8 }]}
      >
        {verdict}
      </Text>
    </View>
  );
}

export function Issue1142SearchBarInsetRepro() {
  const navigation = useNavigation();

  return (
    <View style={styles.hub} testID="issue-1142-hub">
      <Text style={styles.heading}>Issue #1142: search-bar inset</Text>
      <Text style={styles.description}>
        Both screens use the same native-stack search bar and the same FlatList
        with contentInsetAdjustmentBehavior="automatic". The only difference is
        whether the list is inside PagerView. The first row must sit just below
        the search bar, and the red marker must sit on the bottom edge of the
        page.
      </Text>
      <Button
        testID="issue-1142-open-plain"
        title="Control: plain FlatList"
        onPress={() => navigation.navigate('Issue #1142 Plain List' as never)}
      />
      <Button
        testID="issue-1142-open-pager"
        title="Repro: FlatList in PagerView"
        onPress={() => navigation.navigate('Issue #1142 Pager List' as never)}
      />
    </View>
  );
}

export function Issue1142PlainListScreen() {
  useSearchHeader();

  return (
    <View style={styles.control} testID="issue-1142-plain-screen">
      <MeasuredList testIDPrefix="issue-1142-plain" />
    </View>
  );
}

export function Issue1142PagerListScreen() {
  useSearchHeader();

  return (
    <View style={styles.pagerHost} testID="issue-1142-pager-screen">
      <PagerView style={styles.pager} initialPage={0} testID="issue-1142-pager">
        <View key="items" style={styles.page} collapsable={false}>
          <MeasuredList testIDPrefix="issue-1142-pager" />
        </View>
        <View
          key="checks"
          style={styles.secondPage}
          collapsable={false}
          testID="issue-1142-second-page"
        >
          <Text style={styles.secondPageText}>Second page</Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  hub: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  control: {
    flex: 1,
    backgroundColor: '#b9f6ca',
  },
  pagerHost: {
    flex: 1,
    backgroundColor: 'magenta',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: '#b9f6ca',
  },
  listHost: {
    flex: 1,
  },
  secondPage: {
    flex: 1,
    backgroundColor: '#bbdefb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondPageText: {
    fontSize: 24,
    fontWeight: '600',
  },
  row: {
    height: 64,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  rowText: {
    color: '#111111',
    fontSize: 18,
  },
  bottomMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: '#ff0000',
  },
  verdict: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
