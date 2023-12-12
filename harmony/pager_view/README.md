> 模板版本：v0.0.1

<p align="center">
  <h1 align="center"> <code>react-native-pager-view</code> </h1>
</p>
<p align="center">
    <a href="https://github.com/callstack/react-native-pager-view">
         <img src="https://img.shields.io/badge/platforms-android%20|%20ios%20|%20harmony%20-lightgrey.svg" alt="Supported platforms" />
    </a>
       <a href="https://github.com/callstack/react-native-pager-view/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
    </a>
</p>

## 安装与使用

**正在 npm 发布中，当前请先从仓库[Release](https://github.com/react-native-oh-library/react-native-pager-view/releases)中获取库 tgz，通过使用本地依赖来安装本库。**

```bash
yarn add xxx
```

或者

```bash
npm install xxx
```

下面的代码展示了这个库的基本使用场景：

```js
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import PagerView from "react-native-pager-view";

const MyPager = () => {
  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      <View key="1">
        <Text>First page</Text>
      </View>
      <View key="2">
        <Text>Second page</Text>
      </View>
    </PagerView>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
});
```

## Link

目前鸿蒙暂不支持 AutoLink，所以 Link 步骤需要手动配置。

首先需要使用 DevEco Studio 打开项目里的鸿蒙工程 `harmony`

### 引入原生端代码

目前有两种方法：

1. 通过 har 包引入（在 IDE 完善相关功能后该方法会被遗弃，目前首选此方法）；
2. 直接链接源码。

方法一：通过 har 包引入
打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "rnoh": "file:../rnoh",
    "rnoh-pager-view": "file:../../node_modules/react-native-pager-view/harmony/pager_view.har"
  }
```

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码
打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "rnoh": "file:../rnoh",
   "rnoh-pager-view": "file:../../node_modules/react-native-pager-view/harmony/pager_view"
  }
```

打开终端，执行：

```bash
cd entry
ohpm install --no-link
```

### 配置 CMakeLists 和引入 ViewPagerPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(OH_MODULE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: add_package_subdirectories
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULE_DIR}/rnoh-pager-view/src/main/cpp" ./pager_view)
# RNOH_END: add_package_subdirectories

add_library(rnoh_app SHARED
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)

target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: link_packages
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_pager_view )
# RNOH_END: link_packages
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
#include "SamplePackage.h"
+ #include "ViewPagerPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<SamplePackage>(ctx),
+     std::make_shared<ViewPagerPackage>(ctx)
    };
}
```

### 在 ArkTs 侧引入 RNCViewPager 组件

打开 `entry/src/main/ets/pages/index.ets`，添加：

```diff
import {
  RNApp,
  ComponentBuilderContext,
  RNAbility,
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider,
} from 'rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, PropsDisplayer } from "rnoh-sample-package"
import { createRNPackages } from '../RNPackagesFactory'
+ import { RNCViewPager, PAGER_VIEW_TYPE } from "rnoh-pager-view"

@Builder
function CustomComponentBuilder(ctx: ComponentBuilderContext) {
  if (ctx.descriptor.type === SAMPLE_VIEW_TYPE) {
    SampleView({
      ctx: ctx.rnohContext,
      tag: ctx.descriptor.tag,
      buildCustomComponent: CustomComponentBuilder
    })
  }
+ else if (ctx.descriptor.type === PAGER_VIEW_TYPE) {
+   RNCViewPager({
+     ctx: ctx.rnohContext,
+     tag: ctx.descriptor.tag,
+     buildCustomComponent: CustomComponentBuilder
+   })
+ }
 ...
}
...
```

### 运行

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 兼容性

要使用此库，需要使用正确的 React-Native 和 RNOH 版本。另外，还需要使用配套的 DevEco Studio 和 手机 ROM。

请到三方库相应的 Releases 发布地址查看 Release 配套的版本信息：[@react-native-oh-tpl/react-native-pager-view Releases](https://github.com/react-native-oh-library/react-native-pager-view/releases)

## 属性

| 名称                                     | 说明                                                                                                                                                                                                                                                                | 类型                           | 是否必填 | 原库平台     | 鸿蒙支持                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------- | ------------ | -------------------------- |
| initialPage                              | Index of initial page that should be selected                                                                                                                                                                                                                       | number                         | 是       | ios，android | yes                        |
| scrollEnabled                            | Should pager view scroll, when scroll enabled                                                                                                                                                                                                                       | bool                           | 是       | ios，android | yes                        |
| onPageScroll                             | Executed when transitioning between pages (ether because the animation for the requested page has changed or when the user is swiping/dragging between pages)                                                                                                       | function                       | 否       | ios，android | yes                        |
| onPageScrollStateChanged                 | Function called when the page scrolling state has changed                                                                                                                                                                                                           | function                       | 否       | ios，android | yes                        |
| onPageSelected                           | This callback will be called once the ViewPager finishes navigating to the selected page                                                                                                                                                                            | function                       | 否       | ios，android | yes                        |
| pageMargin                               | Blank space to be shown between pages                                                                                                                                                                                                                               | number （取值范围:0~屏幕宽度） | 否       | ios，android | 仅支持取 0-368（屏幕宽度） |
| keyboardDismissMode                      | Determines whether the keyboard gets dismissed in response to a drag                                                                                                                                                                                                | one of 'none' ,'on-drag'       | 否       | ios,droid    | yes                        |
| orientation                              | Set horizontal or vertical scrolling orientation (it does not work dynamically)                                                                                                                                                                                     | one of horizontal vertical     | 否       | ios，android | yes                        |
| overScrollMode                           | Used to override default value of overScroll mode. Can be auto, always or never. Defaults to auto                                                                                                                                                                   | one of auto, always ,never     | 否       | android      | yes                        |
| offscreenPageLimit                       | Set the number of pages that should be retained to either side of the currently visible page(s). Pages beyond this limit will be recreated from the adapter when needed. Defaults to RecyclerView's caching strategy. The given value must either be larger than 0. | number                         | 否       | android      | yes                        |
| overdrag                                 | Allows for overscrolling after reaching the end or very beginning or pages. Defaults to false                                                                                                                                                                       | bool                           | 否       | ios          | yes                        |
| layoutDirection                          | Specifies layout direction. Use ltr or rtl to set explicitly or locale to deduce from the default language script of a locale. Defaults to locale                                                                                                                   | string                         | 否       | android,ios  | yes                        |
| setPage(index: number)                   | Function to scroll to a specific page in the PagerView. Invalid index is ignored.                                                                                                                                                                                   | function                       | 否       | android,ios  | yes                        |
| setPageWithoutAnimation(index: number)   | Function to scroll to a specific page in the PagerView. Invalid index is ignored.                                                                                                                                                                                   | function                       | 否       | android,ios  | yes                        |
| setScrollEnabled(scrollEnabled: boolean) | FA helper function to enable/disable scroll imperatively. The recommended way is using the scrollEnabled prop, however, there might be a case where a imperative solution is more useful (e.g. for not blocking an animation)                                       | function                       | 否       | android,ios  | yes                        |

## 遗留问题

## 其他

## 开源协议

本项目基于 [The MIT License (MIT)](https://github.com/react-native-oh-library/react-native-pager-view/blob/harmony/LICENSE) ，请自由地享受和参与开源。
