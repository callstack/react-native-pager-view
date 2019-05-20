// @flow

const React = require('react');
const ReactNative = require('react-native');
const {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} = ReactNative;
import ViewPagerAndroid from '@react-native-community/viewpager';

type Props = $ReadOnly<{||}>;
type State = {|likes: number|};
class LikeCount extends React.Component<Props, State> {
  state = {
    likes: 7,
  };

  onClick = () => {
    this.setState({likes: this.state.likes + 1});
  };

  render() {
    const thumbsUp = '\uD83D\uDC4D';
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