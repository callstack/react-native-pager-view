/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { thumbsUp } from '../utils';

type Props = {};
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
