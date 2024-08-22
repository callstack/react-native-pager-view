import React, { Children, ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export const LEGACY_childrenWithOverriddenStyle = (children?: ReactNode) => {
  return Children.map(children, (child) => {
    const element = child as React.ReactElement;
    return (
      // Add a wrapper to ensure layout is calculated correctly
      <View style={StyleSheet.absoluteFill} collapsable={false}>
        {/* @ts-ignore */}
        {React.cloneElement(element, {
          ...element.props,
          // Override styles so that each page will fill the parent.
          style: [element.props.style, StyleSheet.absoluteFill],
        })}
      </View>
    );
  });
};

export const childrenWithOverriddenStyle = (
  children?: ReactNode,
  pageMargin = 0
) => {
  return Children.map(children, (child) => {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          paddingHorizontal: pageMargin / 2,
          position: Platform.OS === 'android' ? 'absolute' : undefined,
        }}
        collapsable={false}
      >
        {child}
      </View>
    );
  });
};
