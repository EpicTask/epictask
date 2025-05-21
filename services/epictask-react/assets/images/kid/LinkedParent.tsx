import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface LinkedParentIconProps {
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle;
}

const LinkedParentIcon: React.FC<LinkedParentIconProps> = ({
  width = 345,
  height = 200,
  fill = "#E2EAF2",
  style,
}) => {
  return (
    <>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 334 203"
        fill="none"
        style={style}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M166.809 56.459C188.364 56.459 207.075 44.2807 216.436 26.4293C223.361 13.2232 234.897 0.458984 249.809 0.458984H306.141C321.053 0.458984 333.141 12.5473 333.141 27.459V175.494C333.141 190.405 321.053 202.494 306.141 202.494H27.4771C12.5654 202.494 0.477051 190.405 0.477051 175.494V27.459C0.477051 12.5473 12.5654 0.458984 27.4771 0.458984H83.8091C98.7208 0.458984 110.257 13.2232 117.182 26.4293C126.543 44.2807 145.254 56.459 166.809 56.459Z"
          fill={fill}
        />
      </Svg>
    </>
  );
};

export default LinkedParentIcon;
