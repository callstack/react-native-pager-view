#ifdef RCT_NEW_ARCH_ENABLED
#import "PagerViewView.h"

#import <react/renderer/components/RNPagerViewViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNPagerViewViewSpec/EventEmitters.h>
#import <react/renderer/components/RNPagerViewViewSpec/Props.h>
#import <react/renderer/components/RNPagerViewViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface PagerViewView () <RCTPagerViewViewViewProtocol>

@end

@implementation PagerViewView {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<PagerViewViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const PagerViewViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<PagerViewViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<PagerViewViewProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor:[self hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> PagerViewViewCls(void)
{
    return PagerViewView.class;
}

- hexStringToColor:(NSString *)stringToConvert
{
    NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
    NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];
    
    unsigned hex;
    if (![stringScanner scanHexInt:&hex]) return nil;
    int r = (hex >> 16) & 0xFF;
    int g = (hex >> 8) & 0xFF;
    int b = (hex) & 0xFF;
    
    return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
}

- (void)changeBackgroundColor:(nonnull NSString *)color {
    [_view setBackgroundColor:[self hexStringToColor:color]];
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTPagerViewViewHandleCommand(self, commandName, args);
}

@end
#endif
