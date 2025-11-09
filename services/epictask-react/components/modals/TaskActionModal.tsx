import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from '../CustomText';
import CustomButton from '../buttons/CustomButton';
import { COLORS } from '@/constants/Colors';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { Timestamp } from 'firebase/firestore';
import DebouncedTouchableOpacity from '../buttons/DebouncedTouchableOpacity';

interface Task {
  task_title?: string;
  name?: string;
  reward?: number;
  reward_amount?: number;
  task_id: string;
  assigned_to_ids?: string[];
  status?: string;
  task_description?: string;
  expiration_date?: string;
  timestamp?: Timestamp;
  user_id?: string;
  rewarded?: boolean;
  marked_completed?: boolean;
}

interface TaskActionModalProps {
  visible: boolean;
  task: Task | null;
  kidName: string;
  onClose: () => void;
  onSave?: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
  onReward?: (taskId: string) => void;
}

export const TaskActionModal: React.FC<TaskActionModalProps> = ({
  visible,
  task,
  kidName,
  onClose,
  onSave,
  onDelete,
  onReward,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'modify'>('view');
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize edited task when task changes
  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!task) return null;

  const taskTitle = task.task_title || 'Untitled Task';
  const taskDescription = task.task_description || 'No description';
  const taskReward = task.reward_amount || task.reward || 0;
  const taskDueDate = task.expiration_date ? new Date(task.expiration_date).toLocaleDateString() : 'No due date';
  const taskStatus = task.status || 'pending';
  const isPending = task.marked_completed === true && !task.rewarded;
  const taskCreated = task.timestamp ? new Date(task.timestamp.nanoseconds).toLocaleDateString() : 'Unknown';

  const handleSave = async () => {
    if (!editedTask || !onSave) return;

    // Validate required fields
    const title = editedTask.task_title || '';
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }

    try {
      setLoading(true);
      await onSave(editedTask);
      setActiveTab('view');
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(task.task_id);
            onClose();
          },
        },
      ]
    );
  };

  const updateEditedTask = (field: string, value: string | number) => {
    if (!editedTask) return;
    setEditedTask({
      ...editedTask,
      [field]: value,
    });
  };

  const renderViewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Title:</Text>
          <Text style={styles.detailValue}>{taskTitle}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue}>{taskDescription}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Assigned to:</Text>
          <Text style={styles.detailValue}>{kidName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reward:</Text>
          <Text style={styles.detailValue}>{taskReward} points</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due Date:</Text>
          <Text style={styles.detailValue}>{taskDueDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(taskStatus) }]}>
            <Text style={styles.statusText}>{taskStatus.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>{taskCreated}</Text>
        </View>
      </View>
      {isPending && (
        <View style={{ marginTop: 20 }}>
          <CustomButton
            text="Reward Task"
            onPress={() => onReward && onReward(task.task_id)}
            fill
          />
        </View>
      )}
    </ScrollView>
  );

  const renderModifyTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Task</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={editedTask?.task_title || ''}
            onChangeText={(value) => updateEditedTask('task_title', value)}
            placeholder="Enter task title"
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={editedTask?.task_description || ''}
            onChangeText={(value) => updateEditedTask('task_description', value)}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reward Points</Text>
          <TextInput
            style={styles.textInput}
            value={String(editedTask?.reward_amount || editedTask?.reward || 0)}
            onChangeText={(value) => updateEditedTask('reward_amount', parseInt(value) || 0)}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Status</Text>
          <View style={styles.statusSelector}>
            {['pending', 'in_progress', 'completed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  editedTask?.status === status && styles.selectedStatusOption,
                ]}
                onPress={() => updateEditedTask('status', status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    editedTask?.status === status && styles.selectedStatusOptionText,
                  ]}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <DebouncedTouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </DebouncedTouchableOpacity>

          <DebouncedTouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </DebouncedTouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return COLORS.light_green || '#4CAF50';
      case 'in_progress':
        return COLORS.light_yellow || '#FF9800';
      case 'pending':
        return COLORS.grey || '#9E9E9E';
      default:
        return COLORS.grey || '#9E9E9E';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Task Actions</Text>
          
          <View style={styles.placeholder} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'view' && styles.activeTab]}
            onPress={() => setActiveTab('view')}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={activeTab === 'view' ? COLORS.primary || '#007AFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'view' && styles.activeTabText,
              ]}
            >
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'modify' && styles.activeTab]}
            onPress={() => setActiveTab('modify')}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={activeTab === 'modify' ? COLORS.primary || '#007AFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'modify' && styles.activeTabText,
              ]}
            >
              Modify
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'view' ? renderViewTab() : renderModifyTab()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.bg || '#F1F6F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEBEC',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: responsiveWidth(4),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary || COLORS.purple,
  },
  tabText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    marginLeft: 8,
  },
  activeTabText: {
    color: COLORS.primary || COLORS.purple,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: responsiveWidth(4),
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderColor: '#EAEBEC',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: '#000',
    marginBottom: responsiveHeight(2),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    width: responsiveWidth(25),
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: responsiveHeight(2),
  },
  inputLabel: {
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '500',
    color: '#000',
    marginBottom: responsiveHeight(1),
  },
  textInput: {
    backgroundColor: COLORS.bg || '#F1F6F9',
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.2),
    fontSize: FONT_SIZES.medium,
    color: '#000',
    borderWidth: 1,
    borderColor: '#EAEBEC',
  },
  multilineInput: {
    height: responsiveHeight(10),
    textAlignVertical: 'top',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: responsiveWidth(2),
  },
  statusOption: {
    flex: 1,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(3),
    borderRadius: 10,
    backgroundColor: COLORS.bg || '#F1F6F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEBEC',
  },
  selectedStatusOption: {
    backgroundColor: COLORS.primary || COLORS.purple,
    borderColor: COLORS.primary || COLORS.purple,
  },
  statusOptionText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    fontWeight: '500',
  },
  selectedStatusOptionText: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: responsiveWidth(3),
    marginTop: responsiveHeight(2.5),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(1.5),
    borderRadius: 12,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: COLORS.primary || COLORS.purple,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '600',
  },
});

export default TaskActionModal;
