#ifdef RCT_NEW_ARCH_ENABLED
#import "PagerViewView.h"

#import <react/renderer/components/PagerViewView/ComponentDescriptors.h>
#import <react/renderer/components/PagerViewView/EventEmitters.h>
#import <react/renderer/components/PagerViewView/Props.h>
#import <react/renderer/components/PagerViewView/RCTComponentViewHelpers.h>

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
    
    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> PagerViewViewCls(void)
{
    return PagerViewView.class;
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
    RCTPagerViewViewHandleCommand(self, commandName, args);
}

- (void)setPage:(NSInteger)selectedPage {
    
}

- (void)setPageWithoutAnimation:(NSInteger)selectedPage {
    
}

- (void)setScrollEnabled:(BOOL)scrollEnabled {
    
}


@end
#endif
