import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import CustomText from '@/components/CustomText';
import ChoiceButton from './ChoiceButton';
import { Node } from '@/api/narrativeService';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { IMAGES } from '@/assets';

interface StoryNodeCardProps {
  node: Node;
  onChoice: (optionId: string | undefined, choiceIndex: number) => void;
  disabled?: boolean;
}

const StoryNodeCard: React.FC<StoryNodeCardProps> = ({ node, onChoice, disabled }) => {
  return (
    <View style={styles.container}>
      {/* Illustration Area */}
      <View style={styles.illustrationArea}>
        <Image 
          source={IMAGES.onboarding_kid_1}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Story Text Area */}
      <View style={styles.textArea}>
        <CustomText variant="bold" style={styles.prompt}>
          {node.prompt}
        </CustomText>
      </View>

      {/* Choices Area */}
      <View style={styles.choicesArea}>
        {node.options && node.options.map((option, index) => (
          <ChoiceButton 
            key={option.option_id ?? option.leads_to ?? index}
            text={option.text}
            icon={index === 0 ? 'star' : 'heart'} 
            onPress={() => onChoice(option.option_id, index)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  illustrationArea: {
    height: responsiveHeight(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  illustration: {
    width: '80%',
    height: '80%',
  },
  textArea: {
    padding: 20,
    justifyContent: 'center',
    minHeight: responsiveHeight(15),
  },
  prompt: {
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 34,
    color: '#333',
  },
  choicesArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
});

export default StoryNodeCard;
