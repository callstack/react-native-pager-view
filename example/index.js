/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import { Navigation } from './src/App';
import { name as appName } from './app.json';

LogBox.ignoreAllLogs(true);

AppRegistry.registerComponent(appName, () => Navigation);
