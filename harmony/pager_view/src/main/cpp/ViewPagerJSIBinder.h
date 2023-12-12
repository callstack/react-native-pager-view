/**
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
#ifndef HARMONY_PAGERVIEW_SRC_MAIN_CPP_VIEWPAGERJSIBINDER_H
#define HARMONY_PAGERVIEW_SRC_MAIN_CPP_VIEWPAGERJSIBINDER_H
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
#endif