import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeProps {
  width?: number;
  height?: number;
  fill?: string;
}

const HomeIcon: React.FC<HomeProps> = ({
  width = 16,
  height = 16,
  fill = 'white',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 23 21" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.3859 0.914589C12.1218 0.694568 11.7383 0.694566 11.4743 0.914589L1.24205 9.44147C0.559978 10.0099 0.961904 11.12 1.84976 11.12H3.40975L3.7942 18.809C3.84472 19.8194 4.67869 20.6128 5.69038 20.6128H10.2689C10.6621 20.6128 10.9808 20.294 10.9808 19.9008V13.9678C10.9808 13.7057 11.1933 13.4932 11.4555 13.4932H12.4047C12.6669 13.4932 12.8794 13.7057 12.8794 13.9678V19.9008C12.8794 20.294 13.1981 20.6128 13.5913 20.6128H18.1698C19.1815 20.6128 20.0155 19.8194 20.066 18.809L20.4504 11.12H22.0104C22.8983 11.12 23.3002 10.0099 22.6181 9.44147L12.3859 0.914589Z"
        fill={fill}
      />
    </Svg>
  );
};

export default HomeIcon;
