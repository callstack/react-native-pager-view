/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';

type Props = {
  progress: {
    position: number,
    offset: number,
  },
  numberOfPages: number,
  size: number,
};

export class ProgressBar extends React.Component<Props> {
  render() {
    const fractionalPosition =
      this.props.progress.position + this.props.progress.offset;

    let progressBarSize = this.props.size;
    if (this.props.numberOfPages !== 1) {
      progressBarSize =
        (fractionalPosition / (this.props.numberOfPages - 1)) * this.props.size;
    }

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
