import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface KidCardIconProps {
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle;
}

const KidCardIcon: React.FC<KidCardIconProps> = ({
  width = 160,
  height = 160,
  fill = "white",
  style,
}) => {
  return (
    <>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 160 160"
        fill="none"
        style={style}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.17987 11.0003C0 15.2785 0 20.879 0 32.0801V126.08C0 137.281 0 142.882 2.17987 147.16C4.09734 150.923 7.15695 153.983 10.9202 155.9C15.1984 158.08 20.7989 158.08 32 158.08H66.4688C70.8464 158.08 73.0352 158.08 73.3644 158.063C83.2954 157.559 85.1847 155.67 85.6888 145.739C85.7055 145.41 85.7055 140.915 85.7055 131.926V131.926C85.7055 108.234 104.911 89.0283 128.603 89.0283V89.0283C139.795 89.0283 145.39 89.0283 145.78 89.0049C156.082 88.3856 157.357 87.1104 157.977 76.8084C158 76.4187 158 73.7102 158 68.2932V32.0801C158 20.879 158 15.2785 155.82 11.0003C153.903 7.23703 150.843 4.17742 147.08 2.25995C142.802 0.0800781 137.201 0.0800781 126 0.0800781H32C20.799 0.0800781 15.1984 0.0800781 10.9202 2.25995C7.15695 4.17742 4.09734 7.23703 2.17987 11.0003Z"
          fill={fill}
        />
      </Svg>
    </>
  );
};

export default KidCardIcon;
