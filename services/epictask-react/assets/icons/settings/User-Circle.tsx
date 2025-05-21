import { StyleSheet, ViewStyle } from "react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";

interface UserCircleProps {
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle;
}

const UserCircle: React.FC<UserCircleProps> = ({
  width = 21,
  height = 20,
  fill = "#151515",
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
          d="M18.7458 9.99984C18.7458 12.511 17.6351 14.7627 15.8781 16.2905C14.415 17.5629 12.5037 18.3332 10.4124 18.3332C8.3212 18.3332 6.40988 17.5629 4.94674 16.2905C3.18981 14.7627 2.0791 12.511 2.0791 9.99984C2.0791 5.39746 5.81006 1.6665 10.4124 1.6665C15.0148 1.6665 18.7458 5.39746 18.7458 9.99984ZM12.9124 7.49984C12.9124 6.11913 11.7931 4.99984 10.4124 4.99984C9.03172 4.99984 7.91243 6.11913 7.91243 7.49984C7.91243 8.88055 9.03172 9.99984 10.4124 9.99984C11.7931 9.99984 12.9124 8.88055 12.9124 7.49984ZM10.4124 11.6665C11.8397 11.6665 12.7783 12.4304 13.4401 13.2794C13.9339 13.9129 13.7639 14.8421 13.0476 15.2054C12.2561 15.6069 11.3607 15.8332 10.4124 15.8332C9.46418 15.8332 8.56878 15.6069 7.77726 15.2054C7.06095 14.8421 6.89099 13.9129 7.38477 13.2794C8.04657 12.4304 8.98515 11.6665 10.4124 11.6665Z"
          fill={fill}
        />
      </Svg>
    </>
  );
};

export default UserCircle;

const styles = StyleSheet.create({});
