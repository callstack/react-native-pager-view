import React, { Children, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export const childrenWithOverriddenStyle = (
  children?: ReactNode,
  pageMargin = 0
) => {
  return Children.map(children, (child) => {
    const element = child as React.ReactElement<any>;
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { marginRight: pageMargin / 2, marginLeft: pageMargin / 2 },
        ]}
        collapsable={false}
      >
        {React.cloneElement(element, {
          ...element.props,
          style: [element.props.style, StyleSheet.absoluteFill],
        })}
      </View>
    );
  });
};
