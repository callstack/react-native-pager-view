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
#ifndef HARMONY_PAGERVIEW_SRC_MAIN_CPP_PROPS_H
#define HARMONY_PAGERVIEW_SRC_MAIN_CPP_PROPS_H

#include <jsi/jsi.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/PropsParserContext.h>

namespace facebook{
  namespace react{

    enum class RNCViewPagerLayoutDirection { Ltr,Rtl };

    inline void fromRawValue(const PropsParserContext& context,const RawValue &value,RNCViewPagerLayoutDirection &result)
    {
      auto string = (std::string)value;
      if(string == "ltr"){
        result = RNCViewPagerLayoutDirection::Ltr;
        return;
      }
      if(string == "rtl"){
        result = RNCViewPagerLayoutDirection::Rtl;
        return;
      }
      abort();
    }

    inline std::string toString(const RNCViewPagerLayoutDirection &value)
    {
      switch (value){
        case RNCViewPagerLayoutDirection::Ltr: return "ltr";
        case RNCViewPagerLayoutDirection::Rtl: return "rtl";
      }
    }
    enum class RNCViewPagerOrientation { Horizontal,Vertical };

    inline void fromRawValue(const PropsParserContext& context,const RawValue &value,RNCViewPagerOrientation &result)
    {
      auto string = (std::string)value;
      if(string == "horizontal"){
        result = RNCViewPagerOrientation::Horizontal;
        return;
      }
      if(string == "vertical"){
        result = RNCViewPagerOrientation::Vertical;
        return;
      }
      abort();
    }

    inline std::string toString(const RNCViewPagerOrientation &value)
    {
      switch (value){
        case RNCViewPagerOrientation::Horizontal: return "horizontal";
        case RNCViewPagerOrientation::Vertical: return "vertical";
      }
    }
    enum class RNCViewPagerOverScrollMode { Auto,Always,Never };

    inline void fromRawValue(const PropsParserContext& context,const RawValue &value,RNCViewPagerOverScrollMode &result)
    {
      auto string = (std::string)value;
      if(string == "auto"){
        result = RNCViewPagerOverScrollMode::Auto;
        return;
      }
      if(string == "always"){
        result = RNCViewPagerOverScrollMode::Always;
        return;
      }
      if(string == "never"){
        result = RNCViewPagerOverScrollMode::Never;
        return;
      }
      abort();
    }

    inline std::string toString(const RNCViewPagerOverScrollMode &value)
    {
      switch (value){
        case RNCViewPagerOverScrollMode::Auto: return "auto";
        case RNCViewPagerOverScrollMode::Always: return "always";
        case RNCViewPagerOverScrollMode::Never: return "never";
      }
    }
    enum class RNCViewPagerKeyboardDismissMode { None,OnDrag };

    inline void fromRawValue(const PropsParserContext& context,const RawValue &value,RNCViewPagerKeyboardDismissMode &result)
    {
      auto string = (std::string)value;
      if(string == "none"){
        result = RNCViewPagerKeyboardDismissMode::None;
        return;
      }
      if(string == "on-drag"){
        result = RNCViewPagerKeyboardDismissMode::OnDrag;
        return;
      }
      abort();
    }

    inline std::string toString(const RNCViewPagerKeyboardDismissMode &value)
    {
      switch (value){
        case RNCViewPagerKeyboardDismissMode::None: return "none";
        case RNCViewPagerKeyboardDismissMode::OnDrag: return "on-drag";
      }
    }

    class JSI_EXPORT RNCViewPagerProps final : public ViewProps{
      public:
        RNCViewPagerProps() = default;
        RNCViewPagerProps(const PropsParserContext& context,const RNCViewPagerProps &sourceProps,const RawProps &rawProps);

      #pragma mark - Props

        bool scrollEnabled{true};
        std::string layoutDirection{toString(RNCViewPagerLayoutDirection::Ltr)};
        int initialPage{0};
        std::string orientation{toString(RNCViewPagerOrientation::Horizontal)};
        int offscreenPageLimit{0};
        int pageMargin{0};
        std::string overScrollMode{toString(RNCViewPagerOverScrollMode::Auto)};
        bool overdrag{false};
        std::string keyboardDismissMode{toString(RNCViewPagerKeyboardDismissMode::None)};
    };

  } // namespace react
} // namespace facebook
#endif