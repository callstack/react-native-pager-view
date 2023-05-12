import React from 'react';
import { AppRegistry } from 'react-native';
import { Navigation } from './src/App';
import { name as appName } from './app.json';
import { BasicPagerViewExample } from './src/BasicPagerViewExample';

AppRegistry.registerComponent(appName, () => Navigation);

AppRegistry.registerComponent('Paper', () => (props) => {
  return <BasicPagerViewExample />;
});
