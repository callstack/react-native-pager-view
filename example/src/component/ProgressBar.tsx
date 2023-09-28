import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface Props extends ViewProps {
  progress: {
    position: number;
    offset: number;
  };
  numberOfPages: number;
}

export class ProgressBar extends React.Component<Props> {
  render() {
    const fractionalPosition =
      this.props.progress.position + this.props.progress.offset;
    const size = fractionalPosition / (this.props.numberOfPages - 1);
    const clampedSize = Math.max(0, Math.min(1, size));
    return (
      <View
        accessibilityValue={{
          min: 0,
          max: 100,
          now: clampedSize * 100,
        }}
        style={styles.progressBarContainer}
      >
        <View
          style={[styles.progressBar, { width: `${clampedSize * 100}%` }]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  progressBarContainer: {
    flex: 1,
    height: 10,
    margin: 10,
    borderColor: '#eeeeee',
    borderWidth: 2,
    justifyContent: 'center',
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
});
