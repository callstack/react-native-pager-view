import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { IMAGE_URIS } from '../utils';

const CARD_HEIGHT = 500;

/**
 * Reproduces https://github.com/callstack/react-native-pager-view/issues/1099
 *
 * On iOS with Fabric and pager-view >= 8.0.4, scroll the first tab vertically.
 * The image in the nested pager can appear pinned while the card border and page
 * indicator continue moving. This happens because the page controller copies the
 * outer ScrollView content view's changing safe-area inset.
 */
export function Issue1099SafeAreaRepro() {
  return (
    <PagerView style={styles.tabs} initialPage={0} testID="issue-1099-tabs">
      <ScrollView
        key="scrollable-tab"
        style={styles.tab}
        contentContainerStyle={styles.scrollContent}
        testID="issue-1099-outer-scroll-view"
      >
        <Text style={styles.heading}>Issue #1099: nested pager safe area</Text>
        <Text style={styles.description}>
          Scroll this tab. On affected iOS Fabric builds, the image may stop
          moving with its card temporarily while the card border and indicator
          continue scrolling.
        </Text>

        <View style={styles.topSpacer} />

        <View style={styles.card} testID="issue-1099-card">
          <PagerView
            style={styles.imagePager}
            initialPage={0}
            testID="issue-1099-image-pager"
          >
            {IMAGE_URIS.slice(0, 3).map((uri, index) => (
              <View
                key={uri}
                collapsable={false}
                style={styles.imagePage}
                testID={`issue-1099-image-page-${index}`}
              >
                <View
                  collapsable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'red',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text>TOP</Text>
                  <Text>BOTTOM</Text>
                </View>
              </View>
            ))}
          </PagerView>
          <View style={styles.indicator} testID="issue-1099-page-indicator">
            <Text style={styles.indicatorText}>Swipe images horizontally</Text>
          </View>
        </View>

        {Array.from({ length: 8 }, (_, index) => (
          <View key={index} style={styles.row}>
            <Text>Scrollable content {index + 1}</Text>
          </View>
        ))}
      </ScrollView>

      <View key="second-tab" style={styles.secondTab} collapsable={false}>
        <Text>Second tab</Text>
      </View>
    </PagerView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
  },
  tab: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    marginTop: 8,
    color: '#444',
    lineHeight: 20,
  },
  topSpacer: {
    height: 180,
  },
  card: {
    height: CARD_HEIGHT,

    borderWidth: 3,
    borderColor: '#5b5bd6',
    backgroundColor: 'white',
  },
  imagePager: {
    height: CARD_HEIGHT - 48,
  },
  imagePage: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicator: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e5ff',
  },
  indicatorText: {
    fontWeight: '600',
  },
  row: {
    height: 120,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  secondTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
