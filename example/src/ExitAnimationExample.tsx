/**
 * PagerView content must stay visible for the whole native-stack exit
 * animation. React Native drops the PagerView instance as soon as the screen
 * is popped, while react-native-screens keeps the view on-screen until its
 * slide-out transition finishes. On Android the Compose pager used to be
 * disposed at drop time, blanking the pages mid-animation.
 */
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import PagerView from 'react-native-pager-view';
import { colors, radius } from './theme';

export type ExitAnimationParamList = {
  'PagerView Exit Animation Example': undefined;
  'PagerView Exit Animation': undefined;
};

const PAGES = [
  { label: '01', color: '#a0b4f5' },
  { label: '02', color: '#f5c6a0' },
  { label: '03', color: '#a0f5c6' },
];

export function ExitAnimationExample() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        ExitAnimationParamList,
        'PagerView Exit Animation Example'
      >
    >();

  return (
    <View style={styles.launcher}>
      <Text style={styles.description}>
        Open the pager screen, then close it. The pager pages should stay
        visible until the screen has fully slid out.
      </Text>
      <Pressable
        testID="exit-animation-open"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => navigation.navigate('PagerView Exit Animation')}
      >
        <Text style={styles.buttonText}>Open pager screen</Text>
      </Pressable>
    </View>
  );
}

export function ExitAnimationPagerScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        ExitAnimationParamList,
        'PagerView Exit Animation'
      >
    >();
  const [page, setPage] = React.useState(0);

  return (
    <View style={styles.flex}>
      <PagerView
        style={styles.flex}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {PAGES.map(({ label, color }, i) => (
          <View
            key={label}
            testID={`exit-animation-page-${i}`}
            style={styles.page}
          >
            <View style={[styles.card, { backgroundColor: color }]}>
              <Text style={styles.cardLabel}>{label}</Text>
            </View>
            <Text style={styles.title}>Page {i + 1}</Text>
            <Text style={styles.description}>
              This content should stay visible until the screen slides out.
            </Text>
          </View>
        ))}
      </PagerView>
      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((page + 1) / PAGES.length) * 100}%` },
            ]}
          />
        </View>
        <Pressable
          testID="exit-animation-close"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>↓ Close page</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  launcher: {
    flex: 1,
    padding: 24,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  card: {
    width: 220,
    height: 220,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: { fontSize: 48, color: colors.foreground },
  title: { fontSize: 24, color: colors.foreground },
  description: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.foreground,
  },
  footer: { padding: 24, gap: 32, alignItems: 'center' },
  progressTrack: {
    alignSelf: 'stretch',
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: colors.primaryForeground, fontWeight: '600' },
});
