import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PagerView, { type PagerViewRef } from 'react-native-pager-view';

import { Button } from './component/Button';
import { colors, radius } from './theme';
import { BGCOLOR } from './utils';

const PAGE_COUNT = 20;
const PRELOAD_DISTANCES = [0, 1, 2, 3];

const padNumber = (value: number) => String(value).padStart(2, '0');

type LazyPageProps = {
  index: number;
  onMountChange: (index: number, mounted: boolean) => void;
};

function LazyPage({ index, onMountChange }: LazyPageProps) {
  useEffect(() => {
    onMountChange(index, true);
    return () => onMountChange(index, false);
  }, [index, onMountChange]);

  return (
    <ScrollView
      testID={`lazy-page-scroll-${index}`}
      contentContainerStyle={styles.pageContent}
    >
      <Text style={styles.title}>{`Mounted page ${index + 1}`}</Text>
      {Array.from({ length: 30 }, (_, row) => (
        <Text key={row} style={styles.row}>{`Page ${index + 1} row ${
          row + 1
        }`}</Text>
      ))}
    </ScrollView>
  );
}

type SegmentedProps = {
  label: string;
  swatchColor: string;
  testID: string;
  options: readonly number[];
  value: number;
  onChange: (value: number) => void;
};

function Segmented({
  label,
  swatchColor,
  testID,
  options,
  value,
  onChange,
}: SegmentedProps) {
  return (
    <View style={styles.segmentedRow}>
      <View style={styles.segmentedLabel}>
        <View style={[styles.swatch, { backgroundColor: swatchColor }]} />
        <Text style={styles.pillLabel}>{label}</Text>
      </View>
      <View style={styles.segmented}>
        {options.map((option) => {
          const isActive = option === value;
          return (
            <Pressable
              key={option}
              testID={`${testID}-${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(option)}
              style={[styles.segment, isActive && styles.segmentActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function LazyPagerViewExample() {
  const ref = useRef<PagerViewRef>(null);
  const [page, setPage] = useState(0);
  const [preloadDistance, setPreloadDistance] = useState(1);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(new Set());

  const onMountChange = useCallback(
    (index: number, isMounted: boolean) =>
      setMounted((prev) => {
        const next = new Set(prev);
        if (isMounted) {
          next.add(index);
        } else {
          next.delete(index);
        }
        return next;
      }),
    []
  );

  const pages = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, index) => (
        <View
          key={index}
          style={{ backgroundColor: BGCOLOR[index % BGCOLOR.length] }}
        >
          <LazyPage index={index} onMountChange={onMountChange} />
        </View>
      )),
    [onMountChange]
  );

  const isFirst = page === 0;
  const isLast = page === PAGE_COUNT - 1;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <PagerView
        ref={ref}
        testID="lazy-pager"
        style={styles.pager}
        initialPage={0}
        lazy
        lazyPreloadDistance={preloadDistance}
        renderLazyPlaceholder={(index) => (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{`Loading page ${
              index + 1
            }`}</Text>
          </View>
        )}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {pages}
      </PagerView>
      <View style={styles.panel}>
        <Segmented
          label="preload"
          swatchColor={colors.mutedForeground}
          testID="lazy-preload"
          options={PRELOAD_DISTANCES}
          value={preloadDistance}
          onChange={setPreloadDistance}
        />
        <View style={[styles.buttons, styles.navigation]}>
          <Button
            testID="lazy-first-page-button"
            text="Start"
            disabled={isFirst}
            onPress={() => ref.current?.setPage(0)}
          />
          <Button
            testID="lazy-prev-page-button"
            text="Prev"
            disabled={isFirst}
            onPress={() => ref.current?.setPage(page - 1)}
          />
          <Button
            testID="lazy-next-page-button"
            text="Next"
            variant="default"
            disabled={isLast}
            onPress={() => ref.current?.setPage(page + 1)}
          />
          <Button
            testID="lazy-last-page-button"
            text="Last"
            variant="default"
            disabled={isLast}
            onPress={() => ref.current?.setPage(PAGE_COUNT - 1)}
          />
        </View>
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {padNumber(page + 1)}
            <Text style={styles.progressTotal}>
              {' / '}
              {padNumber(PAGE_COUNT)}
            </Text>
          </Text>
          <View style={styles.map}>
            {Array.from({ length: PAGE_COUNT }, (_, index) => (
              <View key={index} style={styles.mapColumn}>
                <View
                  style={[
                    styles.mountedCell,
                    mounted.has(index) && styles.mountedCellActive,
                  ]}
                >
                  {index === page && <View style={styles.currentDot} />}
                </View>
                <View
                  style={[
                    styles.rangeCell,
                    Math.abs(index - page) <= preloadDistance &&
                      styles.rangeCellPreload,
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={[styles.pill, styles.mountedPill]}>
            <Text style={styles.pillLabel}>mounted</Text>
            <Text testID="lazy-mounted-count" style={styles.pillValue}>
              {mounted.size}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pager: {
    flex: 1,
  },
  pageContent: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
  },
  row: {
    paddingVertical: 8,
    color: colors.foreground,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
  },
  placeholderText: {
    color: colors.mutedForeground,
  },
  panel: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigation: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  segmentedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  segmentedLabel: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 10,
    height: 4,
    borderRadius: radius.full,
  },
  segmented: {
    flex: 1,
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: radius.md - 1,
  },
  segmentActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  segmentTextActive: {
    color: colors.foreground,
  },
  pill: {
    height: 36,
    minWidth: 56,
    margin: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  mountedPill: {
    margin: 0,
    gap: 8,
  },
  pillLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  pillValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 36,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  progressText: {
    fontVariant: ['tabular-nums'],
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  progressTotal: {
    fontWeight: '400',
    color: colors.mutedForeground,
  },
  map: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  mapColumn: {
    flex: 1,
    gap: 3,
  },
  mountedCell: {
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.muted,
  },
  mountedCellActive: {
    backgroundColor: colors.primary,
  },
  currentDot: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  rangeCell: {
    height: 4,
    borderRadius: radius.full,
  },
  rangeCellPreload: {
    backgroundColor: colors.mutedForeground,
  },
});
