#pragma once

//These imports come from the common/cpp directory 
#include <react/renderer/components/pagerview/EventEmitters.h>
#include <react/renderer/components/pagerview/Props.h>
//This import comes from the codegen directory 
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
