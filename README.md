# react-native-viewpager

[![CircleCI branch](https://img.shields.io/circleci/project/github/react-native-community/react-native-viewpager/master.svg)](https://circleci.com/gh/react-native-community/react-native-viewpager/tree/master)

*Note: This module has been extracted from `react-native` as a part of the 
[Lean Core](https://github.com/facebook/react-native/issues/23313) effort.*

This component allows the user to swipe left and right through pages of data. Under the hood it is using the native [Android](https://developer.android.com/reference/android/support/v4/view/ViewPager) and [iOS](https://developer.apple.com/documentation/uikit/uipageviewcontroller) implementation. You can use it to see the native transitions between each screen contained in `ViewPager`. 

![](viewpager.gif)

# Getting started

`yarn add @react-native-community/viewpager`

# Linking 

#### Using React Native <0.60

`react-native link @react-native-community/viewpager`

<details>
<summary>Manually link the library on iOS</summary>

Follow the [instructions in the React Native documentation](https://facebook.github.io/react-native/docs/linking-libraries-ios#manual-linking) to manually link the framework or link using [Cocoapods](https://cocoapods.org) by adding this to your `Podfile`:

```ruby
pod 'react-native-viewpager', :path => '../node_modules/@react-native-community/viewpager'
```

</details>

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

#### Using React Native >= 0.60

Use [Jetifier tool](https://github.com/mikehardy/jetifier) for backward-compatibility. Migration will be done in the [future](https://github.com/react-native-community/react-native-viewpager/pull/22#issuecomment-516340194)


# Usage

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

# API

|Prop|Description|Platform|
|-|:-----:|:---:|
|`initialPage`|Index (`number`) of initial page that should be selected|both
|`scrollEnabled: boolean`|Should viewpager scroll, when scroll enabled|both
|`onPageScroll: (e: PageScrollEvent) => void`|Executed, when transitioning between pages (ether because of animation for the requested page change or when user is swiping/dragging between pages)|both
|`onPageScrollStateChanged: (e: PageScrollStateChangedEvent) => void`|Function called when the page scrolling state has changed|both
|`onPageSelected: (e: PageSelectedEvent) => void`|This callback will be called once ViewPager finish navigating to selected page|both
|`pageMargin: number`|Blank space to show between pages|both
|~~peekEnabled: boolean~~| The preview of last and next page will show in current screen. [See how to achive that](https://github.com/facebook/react-native/issues/16158)|both
|`keyboardDismissMode: ('none' | 'on-drag')`|Determines whether the keyboard gets dismissed in response to  a drag|both
|`orientation: Orientation`|Set `horizontal` or `vertical` scrolling orientation of Viewpager|iOS
|`transitionStyle: TransitionStyle`|Use `scroll` or `curl` to change transiotion style|iOS