# react-native-viewpager

[![CircleCI branch](https://img.shields.io/circleci/project/github/react-native-community/react-native-viewpager/master.svg)](https://circleci.com/gh/react-native-community/react-native-viewpager/tree/master)

*Note: This module has been extracted from `react-native` as a part of the 
[Lean Core](https://github.com/facebook/react-native/issues/23313) effort.*

This component allows the user to swipe left and right through pages of data. Under the hood it is using the native [Android ViewPager](https://developer.android.com/reference/android/support/v4/view/ViewPager) and the [iOS UIPageViewController](https://developer.apple.com/documentation/uikit/uipageviewcontroller) implementations.

<img src="docs/viewpager-logo.png" alt="ViewPager" width="500" height="500">

## Getting started

`yarn add @react-native-community/viewpager`

## Linking 

`react-native link @react-native-community/viewpager`

<details>
<summary>Manually link the library on iOS</summary>
</br>

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

## API

|Prop|Description|Platform|
|-|:-----:|:---:|
|`initialPage`|Index of initial page that should be selected|both
|`scrollEnabled: boolean`|Should viewpager scroll, when scroll enabled|both
|`onPageScroll: (e: PageScrollEvent) => void`|Executed when transitioning between pages (ether because the animation for the requested page has changed or when the user is swiping/dragging between pages)|both
|`onPageScrollStateChanged: (e: PageScrollStateChangedEvent) => void`|Function called when the page scrolling state has changed|both
|`onPageSelected: (e: PageSelectedEvent) => void`|This callback will be called once the ViewPager finishes navigating to the selected page|both
|`pageMargin: number`|Blank space to be shown between pages|both
|`keyboardDismissMode: ('none' / 'on-drag')`| Determines whether the keyboard gets dismissed in response to a drag|both
|`orientation: Orientation`|Set `horizontal` or `vertical` scrolling orientation|iOS
|`transitionStyle: TransitionStyle`|Use `scroll` or `curl` to change transition style|iOS

## Preview

### Android

<img src="docs/android-viewpager.gif" alt="ViewPager" width="325">

### iOS

horizontal - scroll      |  horizontal - curl
:-------------------------:|:-------------------------:
<img src="docs/ios-viewpager-scroll.gif" alt="ViewPager" width="325">  |  <img src="docs/ios-viewpager-curl.gif" alt="ViewPager" width="325">

vertical - scroll        |  vertical - curl
:-------------------------:|:-------------------------:
<img src="docs/ios-viewpager-vertical.gif" alt="ViewPager" width="325">  |  <img src="docs/ios-viewpager-vertical-curl.gif" alt="ViewPager" width="325">
