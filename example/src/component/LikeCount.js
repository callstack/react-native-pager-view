// @flow

import React from 'react';
import { Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View } from 'react-native' 

import ViewPagerAndroid from '@react-native-community/viewpager';
import { thumbsUp } from './../../Common'

type Props = $ReadOnly<{||}>;
type State = {|likes: number|};
class LikeCount extends React.Component<Props, State> {
  state = {
    likes: 7,
  };

  onClick = () => {
    this.setState(state => ({ likes: state.likes + 1}));
  };

  render() {
    return (
      <View style={styles.likeContainer}>
        <TouchableOpacity onPress={this.onClick} style={styles.likeButton}>
          <Text style={styles.likesText}>{thumbsUp + ' Like'}</Text>
        </TouchableOpacity>
        <Text style={styles.likesText}>{this.state.likes + ' likes'}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    likesText: {
      flex: 1,
      fontSize: 18,
      alignSelf: 'center',
    },
  });