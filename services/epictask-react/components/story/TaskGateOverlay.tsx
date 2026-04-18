import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import CustomText from '@/components/CustomText';
import { COLORS } from '@/constants/Colors';
import TaskGateCard from './TaskGateCard';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { BlurView } from 'expo-blur';

interface TaskGateOverlayProps {
  visible: boolean;
  taskName: string;
  taskReward: number;
}

const TaskGateOverlay: React.FC<TaskGateOverlayProps> = ({ visible, taskName, taskReward }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.container}>
          <View style={styles.content}>
            <CustomText variant="bold" style={styles.title}>
              Complete this task first!
            </CustomText>
            <TaskGateCard name={taskName} stars={taskReward} />
            <CustomText style={styles.instruction}>
              Ask mom or dad to help you!
            </CustomText>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    width: responsiveWidth(90),
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 24,
    color: COLORS.primary || '#EE4266',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 18,
    color: COLORS.grey,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default TaskGateOverlay;
