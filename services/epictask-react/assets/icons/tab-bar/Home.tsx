import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface HomeIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

const HomeIcon: React.FC<HomeIconProps> = ({
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
      <Path
        d="M10.5807 3.32568H5.03855C4.42638 3.32568 3.93011 3.82195 3.93011 4.43412V12.1932C3.93011 12.8053 4.42638 13.3016 5.03855 13.3016H10.5807C11.1929 13.3016 11.6892 12.8053 11.6892 12.1932V4.43412C11.6892 3.82195 11.1929 3.32568 10.5807 3.32568Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.7735 3.32568H17.2314C16.6192 3.32568 16.1229 3.82195 16.1229 4.43412V7.75943C16.1229 8.3716 16.6192 8.86786 17.2314 8.86786H22.7735C23.3857 8.86786 23.882 8.3716 23.882 7.75943V4.43412C23.882 3.82195 23.3857 3.32568 22.7735 3.32568Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.7735 13.3013H17.2314C16.6192 13.3013 16.1229 13.7975 16.1229 14.4097V22.1688C16.1229 22.7809 16.6192 23.2772 17.2314 23.2772H22.7735C23.3857 23.2772 23.882 22.7809 23.882 22.1688V14.4097C23.882 13.7975 23.3857 13.3013 22.7735 13.3013Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5807 17.7354H5.03855C4.42638 17.7354 3.93011 18.2316 3.93011 18.8438V22.1691C3.93011 22.7813 4.42638 23.2775 5.03855 23.2775H10.5807C11.1929 23.2775 11.6892 22.7813 11.6892 22.1691V18.8438C11.6892 18.2316 11.1929 17.7354 10.5807 17.7354Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HomeIcon;