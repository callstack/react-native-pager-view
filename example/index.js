import React, { useMemo } from 'react';
import {
  AppRegistry,
  View,
  SafeAreaView,
  Animated,
  Text,
  Platform,
} from 'react-native';
import { Navigation } from './src/App';
import { name as appName } from './app.json';
import { BasicPagerViewExample } from './src/BasicPagerViewExample';
import PagerView from 'react-native-pager-view';
import { useNavigationPanel } from './src/hook/useNavigationPanel';
import { LikeCount } from './src/component/LikeCount';
import { NavigationPanel } from './src/component/NavigationPanel';
import { PaperExample } from './src/PaperExample';

AppRegistry.registerComponent(appName, () => Navigation);
