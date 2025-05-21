import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface BackArrowIconProps {
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle;
}

const BackArrowIcon: React.FC<BackArrowIconProps> = ({
  width = 20,
  height = 18,
  fill = '#151515',
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 18"
      fill="none"
      style={style}
    >
      <Path
        d="M8.54147 0.676033C8.8782 0.343302 9.42091 0.346542 9.75364 0.683269C10.0864 1.02 10.0831 1.5627 9.7464 1.89543L3.42391 8.14287H18.5742C19.0476 8.14287 19.4313 8.52663 19.4313 9.00002C19.4313 9.4734 19.0476 9.85716 18.5742 9.85716H3.42587L9.7464 16.1027C10.0831 16.4354 10.0864 16.9781 9.75364 17.3148C9.42091 17.6516 8.8782 17.6548 8.54147 17.3221L0.889761 9.76117C0.465294 9.34174 0.465295 8.65636 0.889761 8.23693L8.54147 0.676033Z"
        fill={fill}
      />
    </Svg>
  );
};

export default BackArrowIcon;