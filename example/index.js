/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import { Navigation } from './src/App';

LogBox.ignoreAllLogs(true);

AppRegistry.registerComponent('PagerViewExample', () => Navigation);
