import React, { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

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
          style: [element.props.style, StyleSheet.absoluteFill],
        })}
      </View>
    );
  });
};
