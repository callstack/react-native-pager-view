import { View, Text, ViewStyle } from 'react-native';
import { LikeCount } from '../component/LikeCount';

type Props = {
  style: ViewStyle;
  index: number;
  prefix?: string;
};

export function PagerViewContent({ style, index, prefix }: Props) {
  return (
    <View testID="pager-view-content" style={style} collapsable={false}>
      <LikeCount />
      <Text testID={`pageNumber${index}`}>{`${
        prefix ? prefix : ''
      }page number ${index}`}</Text>
    </View>
  );
}
