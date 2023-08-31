import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import { thumbsUp } from '../utils';

interface Props extends ViewProps {}
type State = { likes: number };

export class LikeCount extends React.Component<Props, State> {
  state = {
    likes: 7,
  };

  onClick = () => {
    this.setState((state) => ({ likes: state.likes + 1 }));
  };

  render() {
    return (
      <View testID="like-count-container" style={styles.likeContainer}>
        <TouchableOpacity
          testID="like-count-touchable"
          onPress={this.onClick}
          style={styles.likeButton}
        >
          <Text testID="like-count-text" style={styles.likesText}>
            {thumbsUp + ' Like'}
          </Text>
        </TouchableOpacity>
        <Text testID="like-count-text2" style={styles.likesText}>
          {this.state.likes + ' likes'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  likeContainer: {
    flexDirection: 'row',
    height: 45,
  },
  likesText: {
    flex: 1,
    fontSize: 18,
    alignSelf: 'center',
  },
  likeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    flex: 1,
    margin: 8,
  },
});
