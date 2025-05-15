import React, { Children, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export const childrenWithOverriddenStyle = (children?: ReactNode) => {
  return Children.map(children, (child) => {
    const element = child as React.ReactElement<any>;
    return (
      // Add a wrapper to ensure layout is calculated correctly
      <View style={StyleSheet.absoluteFill} collapsable={false}>
        {React.cloneElement(element, {
          ...element.props,
          // Override styles so that each page will fill the parent.
          style: [element.props.style, StyleSheet.absoluteFill],
        })}
      </View>
    );
  });
};
