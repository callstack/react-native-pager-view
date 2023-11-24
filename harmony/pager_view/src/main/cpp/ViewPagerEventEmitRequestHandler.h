#pragma once
#include <napi/native_api.h>
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "EventEmitters.h"
#include <glog/logging.h>

using namespace facebook;
namespace rnoh{

  enum PageEventType{
    PAGE_SCROLL = 0,
    PAGE_SELECTED = 1,
    PAGE_SCROLL_STATE_CHANGED = 2,
  };

  PageEventType getPageEventType(ArkJS &arkJs,napi_value eventObject)
  {
    auto eventType = arkJs.getString(arkJs.getObjectProperty(eventObject,"type"));
    if(eventType == "scroll"){
      return PageEventType::PAGE_SCROLL;
    }else if(eventType == "selected"){
      return PageEventType::PAGE_SELECTED;
    }else if(eventType == "scroll_state_changed"){
      return PageEventType::PAGE_SCROLL_STATE_CHANGED;
    }else{
      throw std::runtime_error("Unknown Page event type");
    }
  }

  class ViewPagerEventEmitRequestHandler : public EventEmitRequestHandler{
    public:
      void handleEvent(EventEmitRequestHandler::Context const &ctx) override
      {
        if(ctx.eventName != "RNCViewPager"){
          return;
        }
        ArkJS arkJs(ctx.env);
        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<react::RNCViewPagerEventEmitter>(ctx.tag);
        if(eventEmitter == nullptr){
          return;
        }
        switch(getPageEventType(arkJs,ctx.payload)){
          case PageEventType::PAGE_SCROLL:{
            double positionIn = arkJs.getDouble(arkJs.getObjectProperty(ctx.payload,"position"));
            double offsetIn = arkJs.getDouble(arkJs.getObjectProperty(ctx.payload,"offset"));
            react::RNCViewPagerEventEmitter::OnPageScroll event = {.position=positionIn,.offset=offsetIn};
            eventEmitter->onPageScroll(event);
            break;
          }
          case PageEventType::PAGE_SELECTED:{
            double pageIndex = arkJs.getDouble(arkJs.getObjectProperty(ctx.payload,"pageIndex"));
            react::RNCViewPagerEventEmitter::OnPageSelected event = {pageIndex};
            eventEmitter->onPageSelected(event);
            break;
          }
          case PageEventType::PAGE_SCROLL_STATE_CHANGED:{
            auto pageScrollState = arkJs.getString(arkJs.getObjectProperty(ctx.payload,"pageScrollState"));
            react::RNCViewPagerEventEmitter::OnPageScrollStateChanged event;
            if(pageScrollState == "idle"){
              event = {react::RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Idle};
            }else if(pageScrollState == "dragging"){
              event = {react::RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Dragging};
            }else if(pageScrollState == "settling"){
              event = {react::RNCViewPagerEventEmitter::OnPageScrollStateChangedPageScrollState::Settling};
            }else{
              throw std::runtime_error("Unknown page scroll state");
            }
            eventEmitter->onPageScrollStateChanged(event);
            break;
          }
          default:
            break;
        }
      };
  };
} // namespace rnoh