// swift-tools-version: 6.0

// Swift Package Manager manifest consumed by React Native's SPM autolinking
// (`npx react-native spm`). CocoaPods keeps using react-native-pager-view.podspec.
//
// The autolinker references this package through a symlink at
// <app>/ios/build/generated/autolinking/libs/react-native-pager-view, and SwiftPM
// resolves the relative `.package(path:)` entries below against that symlink,
// so they point at the app's prebuilt React Native and codegen packages.

import PackageDescription

let reactNativeHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

// Must match the prebuilt React.framework's config-gated C++ ABI, otherwise the
// Release link fails on DebugStringConvertible's vtable.
let reactCxxDefines: [CXXSetting] = [
    .define("DEBUG", .when(configuration: .debug)),
    .define("NDEBUG", .when(configuration: .release)),
]

let package = Package(
    name: "react-native-pager-view",
    platforms: [.iOS("15.1"), .visionOS(.v1)],
    products: [
        .library(name: "react-native-pager-view", targets: ["react-native-pager-view", "RNCPagerViewSwift"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(url: "https://github.com/siteline/swiftui-introspect", from: "1.0.0"),
    ],
    targets: [
        // SwiftPM can't mix Swift and ObjC++ in one target, so the Swift
        // sources build separately. ObjC++ can't import Swift (no C++ modules),
        // so the dependency runs the other way: Swift implements the ObjC API
        // in RNCPagerViewProviding.h, and both targets ship in the product.
        .target(
            name: "RNCPagerViewSwift",
            dependencies: [
                "react-native-pager-view",
                .product(name: "SwiftUIIntrospect", package: "swiftui-introspect"),
            ] + reactNativeHeaders,
            path: ".",
            sources: [
                "Extensions.swift",
                "PagerGestureObserver.swift",
                "PagerScrollDelegate.swift",
                "PagerScrollDelegateIOS15.swift",
                "PagerView.swift",
                "PagerViewIOS15Compat.swift",
                "PagerViewIOS15NavigationBarCompat.swift",
                "PagerViewProps.swift",
                "PagerViewProvider.swift",
            ],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .target(
            name: "react-native-pager-view",
            dependencies: reactNativeHeaders,
            path: ".",
            sources: [
                "RCTOnPageScrollEvent.m",
                "RNCPagerViewComponentView.mm",
            ],
            publicHeadersPath: ".",
            cxxSettings: reactCxxDefines,
            linkerSettings: [
                .linkedFramework("UIKit"),
                .linkedFramework("SwiftUI"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
