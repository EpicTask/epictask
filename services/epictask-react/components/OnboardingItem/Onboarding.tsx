import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, ImageSourcePropType } from 'react-native';

interface OnboardingItemProps {
  item: {
    id: string;
    image: ImageSourcePropType;
  };
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({ item }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <Image source={item.image} style={[styles.image, { width, resizeMode: 'contain' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default OnboardingItem;