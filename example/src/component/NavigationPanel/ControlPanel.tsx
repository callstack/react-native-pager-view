import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import type { NavigationPanelProps } from './types';

export function ControlsPanel({
  page,
  animated,
  pages,
  scrollState,
  scrollEnabled,
  progress,
  disablePagesAmountManagement,
  overdragEnabled,
  setPage,
  addPage,
  removePage,
  toggleScroll,
  toggleAnimation,
  toggleOverdrag,
}: NavigationPanelProps) {
  const firstPage = useCallback(() => setPage(0), [setPage]);
  const prevPage = useCallback(() => setPage(page - 1), [page, setPage]);
  const nextPage = useCallback(() => setPage(page + 1), [setPage, page]);
  const lastPage = useCallback(() => setPage(pages.length - 1), [
    pages.length,
    setPage,
  ]);
  return (
    <>
      <View style={styles.buttons}>
        <Button
          testID="scroll-enabled-button"
          text={scrollEnabled ? 'Scroll Enabled' : 'Scroll Disabled'}
          onPress={toggleScroll}
        />
        <Button
          style={styles.buttonAdjustment}
          text={overdragEnabled ? 'Overdrag Enabled' : 'Overdrag Disabled'}
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
          testID="add-page-button"
          text={animated ? 'Turn off animations' : 'Turn animations back on'}
          onPress={toggleAnimation}
        />
        <View style={styles.scrollState}>
          <Text style={styles.scrollStateText}>
            ScrollState[ {scrollState} ]
          </Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <Button
          testID="start-page-button"
          text="Start"
          disabled={page === 0}
          onPress={firstPage}
        />
        <Button
          testID="prev-page-button"
          text="Prev"
          disabled={page === 0}
          onPress={prevPage}
        />
        <Button
          testID="next-page-button"
          text="Next"
          disabled={page === pages.length - 1}
          onPress={nextPage}
        />
        <Button
          testID="last-page-button"
          text="Last"
          disabled={page === pages.length - 1}
          onPress={lastPage}
        />
      </View>
      <View style={styles.progress}>
        <Text style={styles.buttonText}>
          Page {page + 1} / {pages.length}{' '}
        </Text>
        <ProgressBar numberOfPages={pages.length} progress={progress} />
      </View>
    </>
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
    borderWidth: 1,
    borderColor: '#000',
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
  buttons: {
    flexDirection: 'row',
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hiddenContainer: {
    height: 0,
    overflow: 'hidden',
  },
  buttonAdjustment: {
    flex: 1,
  },
  progress: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: 'black',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    paddingHorizontal: 20,
  },
  scrollState: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollStateText: {
    color: '#99d1b7',
    textAlign: 'center',
  },
});
