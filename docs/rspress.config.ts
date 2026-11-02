import { withCallstackPreset } from '@callstack/rspress-preset';

export default await withCallstackPreset(
  {
    context: import.meta.dirname,
    docs: {
      title: 'React Native Pager View',
      description:
        'Native pager component for React Native, backed by Jetpack Compose on Android and SwiftUI on iOS.',
      editUrl:
        'https://github.com/callstack/react-native-pager-view/edit/main/docs/docs',
      icon: '/logo.svg',
      logoLight: '/logo-light.svg',
      logoDark: '/logo-dark.svg',
      rootDir: 'docs',
      rootUrl: 'https://oss.callstack.com/react-native-pager-view/',
      socials: {
        github: 'https://github.com/callstack/react-native-pager-view',
      },
    },
  },
  {
    base: '/react-native-pager-view/',
  }
);
