# react-native-viewpager

[![CircleCI branch](https://img.shields.io/circleci/project/github/react-native-community/react-native-viewpager/master.svg)](https://circleci.com/gh/react-native-community/react-native-viewpager/tree/master)

At the moment, this module only works for Android. Under the hood is using the native Android 
[ViewPager](https://developer.android.com/reference/android/support/v4/view/ViewPager).

## Getting started

`yarn add @react-native-community/viewpager`

### Mostly automatic installation

`react-native link @react-native-community/viewpager`

## Usage

```js
import ViewPager from "@react-native-community/viewpager";

class MyPager extends React.Component { 
  render() {
    return (
      <ViewPager
        style={styles.viewPager}
        initialPage={0}>
        <View key="1">
          <Text>First page</Text>
        </View>
        <View key="2">
          <Text>Second page</Text>
        </View>
      </ViewPager>
    );
  }
}

const styles = StyleSheet.create({
  viewPager: {
    flex: 1
  },
})
```
