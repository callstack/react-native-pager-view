import React, { Children, ReactNode } from 'react';
import { View } from 'react-native';

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
        }}
        collapsable={false}
      >
        {child}
      </View>
    );
  });
};
