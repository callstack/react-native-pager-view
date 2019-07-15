/* @flow */

import React from 'react';
import {AppRegistry} from 'react-native';

import {name as appName}  from './app.json';
import ViewPagerExample from "./ViewPagerExample";

class ExampleApp extends React.Component<{}> {
  render() {
    return (
        <ViewPagerExample />
    )
  }
}

AppRegistry.registerComponent(appName, () => ExampleApp);
