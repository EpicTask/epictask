import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface BasicInfoIconProps {
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle;
}

const BasicInfoIcon: React.FC<BasicInfoIconProps> = ({
  width = 21,
  height = 20,
  fill = "black",
  style,
}) => {
  return (
    <>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 21 20"
        fill="none"
        style={style}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.29175 10.0003C1.29175 5.05277 5.30253 1.04199 10.2501 1.04199C15.1976 1.04199 19.2084 5.05277 19.2084 10.0003C19.2084 14.9479 15.1976 18.9587 10.2501 18.9587C5.30253 18.9587 1.29175 14.9479 1.29175 10.0003ZM10.7225 6.04951C10.4966 5.78858 10.1019 5.76024 9.84092 5.98621C9.57999 6.21218 9.55165 6.6069 9.77763 6.86783L9.78484 6.87616C10.0108 7.13709 10.4055 7.16543 10.6665 6.93946C10.9274 6.71349 10.9557 6.31878 10.7298 6.05785L10.7225 6.04951ZM9.41675 7.917C9.07157 7.917 8.79175 8.19682 8.79175 8.542C8.79175 8.88718 9.07157 9.167 9.41675 9.167H9.6314L9.62508 13.5411C9.62458 13.8863 9.904 14.1665 10.2492 14.167C10.5944 14.1675 10.8746 13.8881 10.8751 13.5429L10.8823 8.5429C10.8825 8.37699 10.8168 8.21779 10.6996 8.10038C10.5823 7.98297 10.4232 7.917 10.2573 7.917H9.41675Z"
          fill={fill}
        />
      </Svg>
    </>
  );
};

export default BasicInfoIcon;
