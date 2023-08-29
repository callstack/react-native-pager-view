import { AppRegistry } from 'react-native';
import { Navigation } from './src/App';
import { BasicPagerViewExample } from './src/BasicPagerViewExample';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => BasicPagerViewExample);

// FOR SOME REASON REANIMATED OR GH IS BROKEN FOR 72
// Uncomment it if more examples are needed
// AppRegistry.registerComponent(appName, () => Navigation);
