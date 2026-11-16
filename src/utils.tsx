import React, { Children, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// A page wrapped in React.memo re-renders whenever its style changes identity,
// so the merged style is reused for as long as the page's own style is.
const pageStyles = new WeakMap<object, StyleProp<ViewStyle>>();

const pageStyle = (style: StyleProp<ViewStyle>) => {
  if (!style) {
    return StyleSheet.absoluteFill;
  }
  let merged = pageStyles.get(style);
  if (!merged) {
    merged = [style, StyleSheet.absoluteFill];
    pageStyles.set(style, merged);
  }
  return merged;
};

export const childrenWithOverriddenStyle = (
  children?: ReactNode,
  pageMargin = 0
) => {
  return Children.map(children, (child) => {
    if (child == null) {
      return null;
    }
    const element = child as React.ReactElement<any>;
    return (
      <View
        style={[StyleSheet.absoluteFill, { marginHorizontal: pageMargin / 2 }]}
        collapsable={false}
      >
        {React.cloneElement(element, {
          style: pageStyle(element.props.style),
        })}
      </View>
    );
  });
};
