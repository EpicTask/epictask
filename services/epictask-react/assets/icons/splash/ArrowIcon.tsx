import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface ArrowIconProps {
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({
  width = 20,
  height = 20,
  fill = '#5E60CE',
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      style={style}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.70946 9.73161C2.70946 9.29437 3.0639 8.93994 3.50112 8.93994H11.4178C11.855 8.93994 12.2095 9.29437 12.2095 9.73161C12.2095 10.1688 11.855 10.5233 11.4178 10.5233H3.50112C3.0639 10.5233 2.70946 10.1688 2.70946 9.73161Z"
        fill={fill}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0442 5.86713C11.3017 5.72935 11.614 5.74444 11.8569 5.90638L16.6069 9.07279C16.8272 9.21956 16.9595 9.46672 16.9595 9.73146C16.9595 9.99611 16.8272 10.2433 16.6069 10.3902L11.8569 13.5571C11.614 13.7191 11.3017 13.7342 11.0443 13.5965C10.7868 13.4587 10.6261 13.1904 10.6261 12.8984V6.56511C10.6261 6.27315 10.7868 6.00489 11.0442 5.86713Z"
        fill={fill}
      />
    </Svg>
  );
};

export default ArrowIcon;
