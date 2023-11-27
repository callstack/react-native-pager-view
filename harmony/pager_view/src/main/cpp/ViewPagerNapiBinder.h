#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include "Props.h"
#include "States.h"

namespace rnoh{

  class ViewPageNapiBinder : public ViewComponentNapiBinder{
    public:
      napi_value createProps(napi_env env,facebook::react::ShadowView const shadowView) override
      {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env,shadowView);
        if(auto props = std::dynamic_pointer_cast<const facebook::react::RNCViewPagerProps>(shadowView.props)){
          return ArkJS(env)
              .getObjectBuilder(napiViewProps)
              .addProperty("initialPage",props->initialPage)
              .addProperty("orientation",props->orientation)
              .addProperty("layoutDirection",props->layoutDirection)
              .addProperty("pageMargin",props->pageMargin)
              .addProperty("offscreenPageLimit",props->offscreenPageLimit)
              .addProperty("scrollEnabled",props->scrollEnabled)
              .addProperty("overScrollMode",props->overScrollMode)
              .addProperty("overdrag",props->overdrag)
              .addProperty("keyboardDismissMode",props->keyboardDismissMode)
              .build();
        }
        return napiViewProps;
      };
  };
  
} // namespace rnoh