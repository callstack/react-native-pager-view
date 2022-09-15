#ifdef RCT_NEW_ARCH_ENABLED
#import "PagerViewView.h"

#import <react/renderer/components/RNCViewPager/ComponentDescriptors.h>
#import <react/renderer/components/RNCViewPager/EventEmitters.h>
#import <react/renderer/components/RNCViewPager/Props.h>
#import <react/renderer/components/RNCViewPager/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface PagerViewView () <RCTRNCViewPagerViewProtocol>

@end

@implementation PagerViewView {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<RNCViewPagerComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNCViewPagerProps>();
        _props = defaultProps;
        
        _view = [[UIView alloc] init];
        
        self.contentView = _view;
    }
    
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<RNCViewPagerProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<RNCViewPagerProps const>(props);
    
    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> RNCViewPagerCls(void)
{
    return PagerViewView.class;
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
    RCTRNCViewPagerHandleCommand(self, commandName, args);
}

- (void)setPage:(NSInteger)selectedPage {
    
}

- (void)setPageWithoutAnimation:(NSInteger)selectedPage {
    
}

- (void)setScrollEnabled:(BOOL)scrollEnabled {
    
}


@end
#endif
