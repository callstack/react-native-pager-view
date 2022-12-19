#pragma once

#include <react/renderer/components/RNCViewPager/EventEmitters.h>
#include <react/renderer/components/RNCViewPager/Props.h>
#include <react/renderer/components/RNCViewPager/RNCViewPagerState.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/LayoutContext.h>

namespace facebook {
namespace react {

extern const char RNCViewPagerComponentName[];

class RNCViewPagerShadowNode final : public ConcreteViewShadowNode<
                                                RNCViewPagerComponentName,
                                                RNCViewPagerProps,
                                                RNCViewPagerEventEmitter,
                                                RNCViewPagerState> {
public:
    using ConcreteViewShadowNode::ConcreteViewShadowNode;
    
#pragma mark - LayoutableShadowNode
    
    void layout(LayoutContext layoutContext) override;
    
private:
    void updateStateIfNeeded();
};

}
}
