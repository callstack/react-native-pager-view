#include "RNCViewPagerShadowNode.h"

#include <react/debug/react_native_assert.h>
#include <react/renderer/core/LayoutMetrics.h>

namespace facebook {
namespace react {

const char RNCViewPagerComponentName[] = "RNCViewPager";

void RNCViewPagerShadowNode::updateStateIfNeeded() {
    ensureUnsealed();
    
    auto contentBoundingRect = Rect{};
    for (const auto &childNode : getLayoutableChildNodes()) {
        contentBoundingRect.unionInPlace(childNode->getLayoutMetrics().frame);
    }
    
    auto state = getStateData();
    
    if (state.contentBoundingRect != contentBoundingRect) {
        state.contentBoundingRect = contentBoundingRect;
        setStateData(std::move(state));
    }
}

#pragma mark - LayoutableShadowNode

void RNCViewPagerShadowNode::layout(LayoutContext layoutContext) {
    ConcreteViewShadowNode::layout(layoutContext);
    updateStateIfNeeded();
}

}
}
