import React, { Children, ReactNode } from 'react';
import { View } from 'react-native';

export const childrenWithOverriddenStyle = (
  children?: ReactNode,
  pageMargin = 0,
  pageWidth?: number,
  pageHeight?: number,
  offscreenPageLimit?: number,
  currentPage?: number
) => {
  return Children.map(children, (child, index) => {
    const element = child as React.ReactElement<any>;
    const marginStyle =
      pageMargin > 0
        ? { marginLeft: pageMargin / 2, marginRight: pageMargin / 2 }
        : null;

    const sizeStyle =
      pageWidth && pageHeight
        ? { width: pageWidth, height: pageHeight }
        : { width: '100%' as const, height: '100%' as const };

    // offscreenPageLimit: only render content within range of current page
    const shouldRenderContent =
      offscreenPageLimit == null ||
      currentPage == null ||
      Math.abs(index - currentPage) <= offscreenPageLimit;

    return (
      <View
        style={[
          sizeStyle,
          // @ts-expect-error scroll-snap-align/stop are web-only CSS properties
          // eslint-disable-next-line react-native/no-inline-styles
          { flexShrink: 0, scrollSnapAlign: 'start', scrollSnapStop: 'always' },
          marginStyle,
        ]}
        collapsable={false}
      >
        {shouldRenderContent
          ? React.cloneElement(element, {
              ...element.props,
              style: [element.props.style, sizeStyle],
            })
          : null}
      </View>
    );
  });
};
