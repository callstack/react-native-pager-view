#pragma once

#include <react/renderer/graphics/Geometry.h>

namespace facebook {
namespace react {

class RNCScrollViewPagerState final {
public:
    Point contentOffset;
    Rect contentBoundingRect;
    
    Size getContentSize() const;
    
};

}
}
