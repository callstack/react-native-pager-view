import React, { Children, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export const childrenWithOverriddenStyle = (
  children?: ReactNode,
  pageMargin = 0,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) => {
  return Children.map(children, (child) => {
    const element = child as React.ReactElement<any>;
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          orientation === 'vertical'
            ? { marginTop: pageMargin / 2, marginBottom: pageMargin / 2 }
            : { marginRight: pageMargin / 2, marginLeft: pageMargin / 2 },
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
