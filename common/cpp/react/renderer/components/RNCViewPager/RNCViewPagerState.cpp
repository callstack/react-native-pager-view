#include "RNCViewPagerState.h"

namespace facebook {
namespace react {

Size RNCViewPagerState::getContentSize() const {
    return contentBoundingRect.size;
}

}
}
