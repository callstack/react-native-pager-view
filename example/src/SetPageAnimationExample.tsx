import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView, {
  type PagerViewRef,
  type SetPageOptions,
} from 'react-native-pager-view';

const COLORS = [
  '#e57373',
  '#f06292',
  '#ba68c8',
  '#7986cb',
  '#4fc3f7',
  '#4db6ac',
  '#aed581',
  '#ffd54f',
];
const LAST_PAGE = COLORS.length - 1;

export function SetPageAnimationExample() {
  const pager = useRef<PagerViewRef>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const currentPage = useRef(0);
  const passing = useRef({ from: 0, to: 0, pages: new Set<number>() });
  const [passed, setPassed] = useState<number[]>([]);

  const go = (page: number, animation: SetPageOptions['animation']) => {
    setEvents([]);
    setPassed([]);
    passing.current = { from: currentPage.current, to: page, pages: new Set() };
    pager.current?.setPage(page, { animation });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.buttons}>
        <Button
          testID="set-page-animation-direct-last"
          title={`direct → ${LAST_PAGE}`}
          onPress={() => go(LAST_PAGE, 'direct')}
        />
        <Button
          testID="set-page-animation-direct-first"
          title="direct → 0"
          onPress={() => go(0, 'direct')}
        />
      </View>
      <View style={styles.buttons}>
        <Button
          testID="set-page-animation-scroll-last"
          title={`scroll → ${LAST_PAGE}`}
          onPress={() => go(LAST_PAGE, 'scroll')}
        />
        <Button
          testID="set-page-animation-scroll-first"
          title="scroll → 0"
          onPress={() => go(0, 'scroll')}
        />
        <Button
          title={isVertical ? 'vertical' : 'horizontal'}
          onPress={() => setIsVertical((vertical) => !vertical)}
        />
      </View>
      <Text testID="set-page-animation-events" style={styles.events}>
        {events.join(' ') || 'No events yet'}
      </Text>
      <Text testID="set-page-animation-passed" style={styles.events}>
        passed: {passed.join(',') || 'none'}
      </Text>
      <PagerView
        key={isVertical ? 'vertical' : 'horizontal'}
        ref={pager}
        style={styles.pager}
        orientation={isVertical ? 'vertical' : 'horizontal'}
        onPageSelected={(e) => {
          currentPage.current = e.nativeEvent.position;
          setEvents((current) => [
            ...current,
            `selected:${e.nativeEvent.position}`,
          ]);
        }}
        onPageScroll={(e) => {
          const { from, to, pages } = passing.current;
          const page = e.nativeEvent.position;
          if (page !== from && page !== to && !pages.has(page)) {
            pages.add(page);
            setPassed([...pages].sort((a, b) => a - b));
          }
        }}
        onPageScrollStateChanged={(e) =>
          setEvents((current) => [...current, e.nativeEvent.pageScrollState])
        }
      >
        {COLORS.map((color, i) => (
          <View
            key={color}
            testID={`set-page-animation-page-${i}`}
            style={[styles.page, { backgroundColor: color }]}
          >
            <Text style={styles.label}>{i}</Text>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  buttons: { flexDirection: 'row', justifyContent: 'space-evenly' },
  events: { padding: 12, fontSize: 14 },
  pager: { flex: 1 },
  page: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 96, fontWeight: 'bold', color: 'white' },
});
