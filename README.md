# react-native-viewpager

[![CircleCI branch](https://img.shields.io/circleci/project/github/react-native-community/react-native-viewpager/master.svg)](https://circleci.com/gh/react-native-community/react-native-viewpager/tree/master)

*Note: This module has been extracted from `react-native` as a part of the 
[Lean Core](https://github.com/facebook/react-native/issues/23313) effort.*

For now, this module only works for Android. Under the hood it is using the native Android 
[ViewPager](https://developer.android.com/reference/android/support/v4/view/ViewPager).

![](viewpager.gif)

## Getting started

`yarn add @react-native-community/viewpager`

### Mostly automatic installation

`react-native link @react-native-community/viewpager`

### Manual installation

#### iOS
Not Supported.

#### Android

<details>
<summary>Manually link the library on Android</summary>
</br>
Make the following changes:

#### `android/settings.gradle`
```groovy
include ':@react-native-community_viewpager'
project(':@react-native-community_viewpager').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-community/viewpager/android')
```

#### `android/app/build.gradle`
```groovy
dependencies {
   ...
   implementation project(':@react-native-community_viewpager')
}
```

#### `android/app/src/main/.../MainApplication.java`
On top, where imports are:

```java
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
```

Add the `RNCViewPagerPackage` class to your list of exported packages.

```java
@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
    new MainReactPackage(),
    new RNCViewPagerPackage()
  );
}
```
</details>

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
