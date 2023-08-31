#pragma once

#include <react/renderer/components/RNCScrollViewPager/EventEmitters.h>
#include <react/renderer/components/RNCScrollViewPager/Props.h>
#include <react/renderer/components/RNCScrollViewPager/RNCScrollViewPagerState.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/LayoutContext.h>
#include <jsi/jsi.h>

namespace facebook {
namespace react {

JSI_EXPORT extern const char RNCScrollViewPagerComponentName[];

/*
 * `ShadowNode` for <RNCScrollViewPager> component.
 */
using RNCScrollViewPagerShadowNode = ConcreteViewShadowNode<
    RNCScrollViewPagerComponentName,
    RNCScrollViewPagerProps,
RNCScrollViewPagerEventEmitter>;

} // namespace react
} // namespace facebook
