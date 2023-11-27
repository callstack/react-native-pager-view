#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh{
  class ViewPageJSIBinder : public ViewComponentJSIBinder{
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override
    {
      auto object = ViewComponentJSIBinder::createNativeProps(rt);
      object.setProperty(rt,"initialPage","int");
      object.setProperty(rt,"orientation","string");
      object.setProperty(rt,"layoutDirection","string");
      object.setProperty(rt,"pageMargin","int");
      object.setProperty(rt,"offscreenPageLimit","int");
      object.setProperty(rt,"scrollEnabled","boolean");
      object.setProperty(rt,"overScrollMode","string");
      object.setProperty(rt,"overdrag","boolean");
      object.setProperty(rt,"keyboardDismissMode","string");

      return object;
    }

    facebook::jsi::Object createBubblingEventTypes(facebook::jsi::Runtime &rt) override
    {
      return facebook::jsi::Object(rt);
    }

    facebook::jsi::Object createDirectEventTypes(facebook::jsi::Runtime &rt) override
    {
      facebook::jsi::Object events(rt);
      events.setProperty(rt,"topPageScroll",createDirectEvent(rt,"onPageScroll"));
      events.setProperty(rt,"topPageSelected",createDirectEvent(rt,"onPageSelected"));
      events.setProperty(rt,"topPageScrollStateChanged",createDirectEvent(rt,"onPageScrollStateChanged"));
      return events;
    }
  };
} // namespace rnoh