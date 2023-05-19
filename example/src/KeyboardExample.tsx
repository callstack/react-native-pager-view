import React, { useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  Button,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import PagerView from 'react-native-pager-view';
import { logoUrl } from './utils';

import { NavigationPanel } from './component/NavigationPanel';
import { useNavigationPanel } from './hook/useNavigationPanel';

interface PageProps {
  title: string;
  description: string;
  onPress: () => void;
  buttonTitle: string;
}
const Page = ({ title, description, onPress, buttonTitle }: PageProps) => {
  return (
    <>
      <Text testID="text-section-title" style={styles.sectionTitle}>
        {title}
      </Text>
      <Text testID="text-section-description" style={styles.sectionDescription}>
        {description}
      </Text>
      <TextInput testID="text-input" style={styles.textInput} />
      <Button
        testID="text-section-buttonTitle"
        onPress={onPress}
        title={buttonTitle}
      />
    </>
  );
};

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export function KeyboardExample() {
  const { ref, ...navigationPanel } = useNavigationPanel(2);
  const { setPage } = navigationPanel;
  return (
    <KeyboardAvoidingView
      testID="keyboard-avoiding"
      style={styles.flex}
      behavior="height"
    >
      <SafeAreaView testID="save-area-view" style={styles.flex}>
        <ScrollView
          testID="scroll-view-container"
          contentContainerStyle={styles.flex}
          style={styles.flex}
        >
          <View testID="logo-container" style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={{
                uri: logoUrl,
              }}
            />
          </View>
          <View testID="pager-container" style={styles.flex}>
            <AnimatedPagerView
              {...navigationPanel}
              testID="pager-view"
              ref={ref}
              style={styles.flex}
              initialPage={0}
              scrollEnabled={false}
            >
              <View testID="pager-view-child-1" style={styles.sectionContainer}>
                <Page
                  title="First Question"
                  description="What is your favorite lib ?"
                  onPress={useCallback(() => setPage(1), [setPage])}
                  buttonTitle="Go to next question"
                />
              </View>
              <View testID="pager-view-child-2" style={styles.sectionContainer}>
                <Page
                  title="Second Question"
                  description="Why Pager View?"
                  onPress={useCallback(() => setPage(0), [setPage])}
                  buttonTitle="Go to previous question"
                />
              </View>
            </AnimatedPagerView>
          </View>
        </ScrollView>
        <NavigationPanel
          {...navigationPanel}
          scrollEnabled={false}
          disablePagesAmountManagement
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
  },
  sectionDescription: {
    marginVertical: 16,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});
