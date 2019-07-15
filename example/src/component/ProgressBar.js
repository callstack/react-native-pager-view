// @flow
import React from 'react';
import { Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View } from 'react-native' 

export class ProgressBar extends React.Component {
    
    render() {
        const fractionalPosition = this.props.progress.position + this.props.progress.offset;
        const progressBarSize = (fractionalPosition / (this.props.numberOfPages - 1)) * this.props.size;
        return (
        <View style={[styles.progressBarContainer, {width: this.props.size}]}>
            <View style={[styles.progressBar, {width: progressBarSize}]} />
        </View>
    );
  }
}

const styles = StyleSheet.create({
    progressBarContainer: {
      height: 10,
      margin: 10,
      borderColor: '#eeeeee',
      borderWidth: 2,
    },
    progressBar: {
      alignSelf: 'flex-start',
      flex: 1,
      backgroundColor: '#eeeeee',
    },
  });