import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { colors, radius } from '../theme';

interface Props extends ViewProps {
  disabled?: boolean;
  onPress: () => void;
  text: string;
  variant?: 'default' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export function Button({
  accessibilityLabel,
  disabled,
  onPress,
  style,
  testID,
  text,
  variant = 'outline',
}: Props) {
  const isOutline = variant === 'outline';
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.outline : styles.primary,
        pressed && (isOutline ? styles.outlinePressed : styles.primaryPressed),
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.buttonText,
          isOutline ? styles.outlineText : styles.primaryText,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    width: 0,
    height: 36,
    margin: 4,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryPressed: {
    opacity: 0.9,
  },
  outline: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  outlinePressed: {
    backgroundColor: colors.muted,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryText: {
    color: colors.primaryForeground,
  },
  outlineText: {
    color: colors.foreground,
  },
});
