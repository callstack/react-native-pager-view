# @react-native-community/viewpager

React Native wrapper for Android and iOS ViewPager

## Installation

```sh
npm install @react-native-community/viewpager
```

## Usage

```js
import { ViewPager } from '@react-native-community/viewpager';

// ...

<ViewPager
  data={data}
  keyExtractor={(item) => item}
  renderItem={({ item }) => <Text>{item}</Text>}
  style={{ flex: 1 }}
/>
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
