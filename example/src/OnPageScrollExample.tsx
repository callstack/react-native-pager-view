import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Animated } from 'react-native';
import PagerView from 'react-native-pager-view';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ProgressBar } from './component/ProgressBar';
import { useNavigationPanel } from './hook/useNavigationPanel';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export function OnPageScrollExample() {
  const { ref, ...navigationPanel } = useNavigationPanel(5);
  const { activePage, setPage, progress, pages } = navigationPanel;

  return (
    <SafeAreaView testID="safe-area-view" style={styles.flex}>
      <View testID="container" style={styles.container}>
        <ScrollView testID="scroll-view" horizontal>
          {pages.map((_v, index) => (
            <TouchableOpacity
              testID={`touchable-view-${index}`}
              key={index}
              onPress={() => setPage(index)}
            >
              <View testID={`container-view-${index}`} style={styles.separator}>
                <Text
                  style={[
                    styles.touchableTitle,
                    activePage === index && styles.touchableTitleActive,
                  ]}
                >
                  Page {index}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <AnimatedPagerView
        testID={'pager-view'}
        {...navigationPanel}
        ref={ref}
        style={styles.PagerView}
        initialPage={0}
      >
        {navigationPanel.pages.map(({ key, style }) => (
          <View
            testID={`pager-view-child-${key}`}
            key={key}
            style={[style, styles.center]}
          >
            <Text
              testID={`pager-view-child-text-${key}`}
              style={styles.text}
            >{`Page Index: ${key}`}</Text>
          </View>
        ))}
      </AnimatedPagerView>
      <View style={styles.progressContainer}>
        <ProgressBar numberOfPages={pages.length} progress={progress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  PagerView: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#63a4ff',
  },
  progressContainer: { flex: 0.1, backgroundColor: '#63a4ff' },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 30,
  },
  separator: {
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  touchableTitle: {
    textAlign: 'center',
    color: '#000',
  },
  touchableTitleActive: {
    color: '#fff',
  },
});
