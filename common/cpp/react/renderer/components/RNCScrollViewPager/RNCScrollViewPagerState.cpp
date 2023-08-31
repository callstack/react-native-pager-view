#include "RNCScrollViewPagerState.h"

namespace facebook {
namespace react {

Size RNCScrollViewPagerState::getContentSize() const {
    return contentBoundingRect.size;
}

}
}
