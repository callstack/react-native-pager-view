#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>

#import "RCTAppDelegate.h"
#import <React/RCTAppSetupUtils.h>
#import <React/RCTRootView.h>

#if RCT_NEW_ARCH_ENABLED
#import <React/CoreModulesPlugins.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <ReactCommon/RCTTurboModuleManager.h>
#import <react/config/ReactNativeConfig.h>

static NSString *const kRNConcurrentRoot = @"concurrentRoot";

@interface AppDelegate () <RCTTurboModuleManagerDelegate, RCTCxxBridgeDelegate> {
  std::shared_ptr<const facebook::react::ReactNativeConfig> _reactNativeConfig;
  facebook::react::ContextContainer::Shared _contextContainer;
  BOOL _newArchitectureEnabled;
}
@end

#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  _newArchitectureEnabled = YES;
  BOOL enableTM = NO;
#if RCT_NEW_ARCH_ENABLED
  enableTM = self.turboModuleEnabled;
#endif

  RCTAppSetupPrepareApp(application, enableTM);

  if (!self.bridge) {
    self.bridge = [self createBridgeWithDelegate:self launchOptions:launchOptions];
  }
#if RCT_NEW_ARCH_ENABLED
  _contextContainer = std::make_shared<facebook::react::ContextContainer const>();
  _reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();
  _contextContainer->insert("ReactNativeConfig", _reactNativeConfig);
  self.bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc] initWithBridge:self.bridge
                                                               contextContainer:_contextContainer];
  self.bridge.surfacePresenter = self.bridgeAdapter.surfacePresenter;
#endif
/**
 https://github.com/react-native-community/RNNewArchitectureApp/blob/new-architecture-benchmarks/App/ios/MeasurePerformance/AppDelegate.mm
  */


  UIView *paperView = RCTAppSetupDefaultRootView(self.bridge, @"Paper", @{}, NO);
  UIView *fabricView = RCTAppSetupDefaultRootView(self.bridge, @"PagerViewExample", @{}, YES);

  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = _newArchitectureEnabled ? fabricView : paperView;
  
  // --- UIWindow setup start ---
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  // --- UIWindow setup end ---
  
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif

}

- (BOOL)concurrentRootEnabled
{
  return _newArchitectureEnabled;
}

/// This method controls whether the `turboModules` feature of the New Architecture is turned on or off.
///
/// @note: This is required to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the Turbo Native Module are enabled. Otherwise, it returns `false`.
- (BOOL)turboModuleEnabled
{
  return _newArchitectureEnabled;
}

/// This method controls whether the App will use the Fabric renderer of the New Architecture or not.
///
/// @return: `true` if the Fabric Renderer is enabled. Otherwise, it returns `false`.
- (BOOL)fabricEnabled
{
  return _newArchitectureEnabled;
}

- (NSDictionary *)prepareInitialProps
{
  NSMutableDictionary *initProps = self.initialProps ? [self.initialProps mutableCopy] : [NSMutableDictionary new];

#ifdef RCT_NEW_ARCH_ENABLED
  initProps[kRNConcurrentRoot] = @([self concurrentRootEnabled]);
#endif

  return initProps;
}

- (RCTBridge *)createBridgeWithDelegate:(id<RCTBridgeDelegate>)delegate launchOptions:(NSDictionary *)launchOptions
{
  return [[RCTBridge alloc] initWithDelegate:delegate launchOptions:launchOptions];
}

- (UIView *)createRootViewWithBridge:(RCTBridge *)bridge
                          moduleName:(NSString *)moduleName
                           initProps:(NSDictionary *)initProps
{
  BOOL enableFabric = NO;
#if RCT_NEW_ARCH_ENABLED
  enableFabric = self.fabricEnabled;
#endif
  return RCTAppSetupDefaultRootView(bridge, moduleName, initProps, enableFabric);
}

- (UIViewController *)createRootViewController
{
  return [UIViewController new];
}

#if RCT_NEW_ARCH_ENABLED
#pragma mark - RCTCxxBridgeDelegate

- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  self.turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                                 delegate:self
                                                                jsInvoker:bridge.jsCallInvoker];
  return RCTAppSetupDefaultJsExecutorFactory(bridge, _turboModuleManager);
}

#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  return RCTCoreModulesClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return nullptr;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                     initParams:
                                                         (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return RCTAppSetupDefaultModuleFromClass(moduleClass);
}

#pragma mark - New Arch Enabled settings

#endif

@end

