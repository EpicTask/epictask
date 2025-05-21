import React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { ViewStyle } from "react-native";

interface KidArrowIconProps {
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle;
}

const KidArrowIcon: React.FC<KidArrowIconProps> = ({
  width = 63,
  height = 63,
  fill = "#654AFF",
  style,
}) => {
  return (
    <>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 63 63"
        fill="none"
        style={style}
      >
        <Rect
          x="0.408386"
          y="0.408203"
          width="62.5916"
          height="62.5916"
          rx="31.2958"
          fill={fill}
        />
        <Path
          d="M24.4384 38.4971L39.743 25.8244M38.43 39.8133L40.4863 28.6077C40.8651 26.5451 39.2445 24.588 37.1475 24.5755L25.7563 24.5076"
          stroke={"#F1F6F9"}
          stroke-width="2.98076"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </>
  );
};

export default KidArrowIcon;
