/**
 * @format
 */
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { Navigation } from './src/App';

AppRegistry.registerComponent(appName, () => Navigation);
