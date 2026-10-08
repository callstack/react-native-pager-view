import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../Button';
import type { NavigationPanelProps } from './types';
import { colors, radius } from '../../theme';

const padNumber = (value: number) => String(value).padStart(2, '0');

export function ControlsPanel({
  activePage,
  isAnimated,
  pages,
  scrollState,
  scrollEnabled,
  progress,
  disablePagesAmountManagement,
  overdrag,
  setPage,
  addPage,
  removePage,
  toggleScroll,
  toggleAnimation,
  toggleOverdrag,
}: NavigationPanelProps) {
  const firstPage = useCallback(() => setPage(0), [setPage]);
  const prevPage = useCallback(
    () => setPage(activePage - 1),
    [activePage, setPage]
  );
  const nextPage = useCallback(
    () => setPage(activePage + 1),
    [setPage, activePage]
  );
  const lastPage = useCallback(
    () => setPage(pages.length - 1),
    [pages.length, setPage]
  );
  const fraction =
    pages.length > 1
      ? (progress.position + progress.offset) / (pages.length - 1)
      : 1;
  const progressPercent = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Button
          testID="scroll-enabled-button"
          text={scrollEnabled ? 'Scroll Enabled' : 'Scroll Disabled'}
          onPress={toggleScroll}
        />
        <Button
          text={overdrag ? 'Overdrag Enabled' : 'Overdrag Disabled'}
          onPress={() => toggleOverdrag()}
        />
      </View>
      {!disablePagesAmountManagement ? (
        <View style={styles.buttons}>
          <Button
            testID="add-page-button"
            text="Add new page"
            onPress={addPage}
          />
          <Button
            testID="remove-page-button"
            text="Remove last page"
            onPress={removePage}
          />
        </View>
      ) : null}
      <View style={styles.buttons}>
        <Button
          testID="animation-toggle-button"
          text={isAnimated ? 'Turn off animations' : 'Turn animations back on'}
          onPress={toggleAnimation}
        />
        <View style={styles.scrollState}>
          <Text style={styles.scrollStateLabel}>state</Text>
          <Text style={styles.scrollStateText}>{scrollState}</Text>
        </View>
      </View>
      <View style={[styles.buttons, styles.navigation]}>
        <Button
          testID="start-page-button"
          text="Start"
          disabled={activePage === 0}
          onPress={firstPage}
        />
        <Button
          testID="prev-page-button"
          text="Prev"
          disabled={activePage === 0}
          onPress={prevPage}
        />
        <Button
          testID="next-page-button"
          text="Next"
          variant="default"
          disabled={activePage === pages.length - 1}
          onPress={nextPage}
        />
        <Button
          testID="last-page-button"
          text="Last"
          variant="default"
          disabled={activePage === pages.length - 1}
          onPress={lastPage}
        />
      </View>
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {padNumber(activePage + 1)}
          <Text style={styles.progressTotal}>
            {' / '}
            {padNumber(pages.length)}
          </Text>
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
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
  scrollState: {
    flex: 1,
    height: 36,
    margin: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  scrollStateLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  scrollStateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 36,
    paddingHorizontal: 4,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
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
});
