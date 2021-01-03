import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  disabled?: boolean;
  onPress: () => void;
  text: string;
  style?: StyleProp<ViewStyle>;
};

export class Button extends React.Component<Props> {
  _handlePress = () => {
    if (!this.props.disabled && this.props.onPress) {
      this.props.onPress();
    }
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={this._handlePress}>
        <View
          style={[
            styles.button,
            !this.props.disabled ? {} : styles.buttonDisabled,
            this.props.style,
          ]}
        >
          <Text style={styles.buttonText}>{this.props.text}</Text>
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
