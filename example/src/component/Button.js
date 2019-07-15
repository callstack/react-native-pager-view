// @flow

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} from 'react-native'

export class Button extends React.Component {
    
  _handlePress = () => {
      if (this.props.enabled && this.props.onPress) {
        this.props.onPress();
      }
    };
  
    render() {
      return (
        <TouchableWithoutFeedback onPress={this._handlePress}>
          <View
            style={[
              styles.button,
              this.props.enabled ? {} : styles.buttonDisabled,
            ]}>
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
})