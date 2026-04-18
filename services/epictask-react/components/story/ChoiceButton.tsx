import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import CustomText from '@/components/CustomText';
import { COLORS } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { responsiveWidth, responsiveHeight } from 'react-native-responsive-dimensions';

interface ChoiceButtonProps {
  text: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, icon, onPress, disabled }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && (
          <MaterialCommunityIcons 
            name={icon as any} 
            size={responsiveHeight(6)} 
            color="white" 
            style={styles.icon}
          />
        )}
        <CustomText variant="bold" style={styles.text}>
          {text}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary || '#EE4266',
    borderRadius: 20,
    padding: responsiveHeight(2.5),
    width: '100%',
    marginBottom: responsiveHeight(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: 'white',
    fontSize: responsiveHeight(3),
    textAlign: 'center',
  },
});

export default ChoiceButton;
