#include "RNCScrollViewPagerShadowNodes.h"

namespace facebook {
namespace react {

const char RNCViewPagerComponentName[] = "RNCViewPager";
const char RNCScrollViewPagerComponentName[] = "RNCScrollViewPager";

void RNCScrollViewPagerShadowNodes::updateStateIfNeeded() {
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

void RNCScrollViewPagerShadowNodes::layout(LayoutContext layoutContext) {
    ConcreteViewShadowNode::layout(layoutContext);
    updateStateIfNeeded();
}

}
}
