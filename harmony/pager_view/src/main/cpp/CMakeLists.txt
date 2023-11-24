cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

file(GLOB rnoh_pager_view_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_pager_view SHARED ${rnoh_pager_view_SRC})
target_include_directories(rnoh_pager_view PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_pager_view PUBLIC rnoh)