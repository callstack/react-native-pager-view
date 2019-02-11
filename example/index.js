/* @flow */

import React from 'react';
import {AppRegistry} from 'react-native';

import {name as appName}  from './app.json';
import ViewPagerAndroidExample from "./ViewPagerAndroidExample";

class ExampleApp extends React.Component<{}> {
  render() {
    return (
        <ViewPagerAndroidExample />
    )
  }
}

AppRegistry.registerComponent(appName, () => ExampleApp);
