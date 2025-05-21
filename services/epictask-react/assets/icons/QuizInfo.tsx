import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface QuizInfoIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

const QuizInfoIcon: React.FC<QuizInfoIconProps> = ({
  width = 15,
  height = 15,
  fill = "#6F6C87",
}) => {
  return (
    <>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 15 15"
        fill="none"
      >
        <Rect width={width} height={height} rx="7.5" fill={fill} />
        <Path
          d="M6.40253 13.334V5.80198H8.58653V13.334H6.40253ZM7.49453 4.75198C7.0932 4.75198 6.76653 4.63532 6.51453 4.40198C6.26253 4.16865 6.13653 3.87932 6.13653 3.53398C6.13653 3.18865 6.26253 2.89932 6.51453 2.66598C6.76653 2.43265 7.0932 2.31598 7.49453 2.31598C7.89586 2.31598 8.22253 2.42798 8.47453 2.65198C8.72653 2.86665 8.85253 3.14665 8.85253 3.49198C8.85253 3.85598 8.72653 4.15932 8.47453 4.40198C8.23186 4.63532 7.9052 4.75198 7.49453 4.75198Z"
          fill="#2B223E"
        />
      </Svg>
    </>
  );
};

export default QuizInfoIcon;
