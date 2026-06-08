import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

interface Props extends ViewProps {
  disabled?: boolean;
  onPress: () => void;
  text: string;
  style?: StyleProp<ViewStyle>;
}

export class Button extends React.Component<Props> {
  _handlePress = () => {
    if (!this.props.disabled && this.props.onPress) {
      this.props.onPress();
    }
  };

  render() {
    const { accessibilityLabel, disabled, style, testID, text } = this.props;

    return (
      <TouchableWithoutFeedback onPress={this._handlePress}>
        <View
          accessibilityLabel={accessibilityLabel}
          testID={testID}
          style={[styles.button, !disabled ? {} : styles.buttonDisabled, style]}
        >
          <Text style={styles.buttonText}>{text}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    width: 0,
    margin: 5,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'gray',
  },
  buttonDisabled: {
    backgroundColor: 'black',
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    margin: 10,
  },
});
