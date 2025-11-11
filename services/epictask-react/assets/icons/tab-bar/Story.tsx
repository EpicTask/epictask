import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoryIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

const StoryIcon: React.FC<StoryIconProps> = ({
  width = 28,
  height = 27,
  stroke = '#5E60CE',
  strokeWidth = 2.21687,
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 28 27"
      fill="none"
      style={style}
    >
      {/* Book cover */}
      <Path
        d="M6 3.5H22C22.8284 3.5 23.5 4.17157 23.5 5V22C23.5 22.8284 22.8284 23.5 22 23.5H6C5.17157 23.5 4.5 22.8284 4.5 22V5C4.5 4.17157 5.17157 3.5 6 3.5Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Book spine */}
      <Path
        d="M8.5 3.5V23.5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Text lines */}
      <Path
        d="M12 9H20"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13.5H20"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 18H18"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default StoryIcon;
