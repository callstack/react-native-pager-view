import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { FabricView } from 'react-native-fabric';
import { Commands } from 'react-native-fabric';
import { Button } from 'react-native';

function getRandomColor() {
  return [Math.random(), Math.random(), Math.random()]
    .map((val) =>
      Math.round(val * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
    .padStart(7, '#');
}
export default function App() {
  const ref = React.useRef(FabricView);
  return (
    <View style={styles.container}>
      <FabricView color="#32a852" style={styles.box} />
      <Button
        title="Change color"
        onPress={() =>
          Commands.changeBackgroundColor(ref.current, getRandomColor())
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
