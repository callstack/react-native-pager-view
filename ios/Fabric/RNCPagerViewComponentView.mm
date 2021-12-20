//
//  RNCPagerViewComponentView.m
//  PagerView
//
//  Copyright © 2021 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RNCPagerViewComponentView.h"

#import <react/renderer/components/PagerView/ComponentDescriptors.h>
#import <react/renderer/components/PagerView/EventEmitters.h>
#import <react/renderer/components/PagerView/Props.h>
#import <react/renderer/components/PagerView/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"


using namespace facebook::react;

@interface RNCPagerViewComponentView () <RCTRNCViewPagerViewProtocol>
@end

@implementation RNCPagerViewComponentView

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNCViewPagerProps>();
    _props = defaultProps;
  }

  return self;
}


#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNCViewPagerComponentDescriptor>();
}


@end

Class<RCTComponentViewProtocol> RNCViewPagerCls(void)
{
  return RNCPagerViewComponentView.class;
}
