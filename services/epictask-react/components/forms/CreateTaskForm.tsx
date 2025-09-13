import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChildSelector } from './ChildSelector';
import { useAuth } from '../../context/AuthContext';
import { validateTaskData } from '../../utils/taskErrorHandler';

interface CreateTaskFormProps {
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to_ids: [] as string[],
    due_date: '',
    reward_amount: '',
    reward_currency: 'eTask',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleChildSelectionChange = (selectedIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      assigned_to_ids: selectedIds
    }));
    
    // Clear assignment error
    if (errors.assigned_to_ids) {
      setErrors(prev => ({
        ...prev,
        assigned_to_ids: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate using the utility function
    const taskValidation = validateTaskData({
      title: formData.title,
      assigned_to_ids: formData.assigned_to_ids,
      due_date: formData.due_date,
      reward_amount: formData.reward_amount ? parseFloat(formData.reward_amount) : undefined
    });

    if (!taskValidation.isValid) {
      taskValidation.errors.forEach(error => {
        if (error.includes('title')) {
          newErrors.title = error;
        } else if (error.includes('assigned')) {
          newErrors.assigned_to_ids = error;
        } else if (error.includes('due date')) {
          newErrors.due_date = error;
        } else if (error.includes('reward')) {
          newErrors.reward_amount = error;
        }
      });
    }

    // Additional custom validations
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    const taskData = {
      ...formData,
      user_id: user?.uid,
      reward_amount: formData.reward_amount ? parseFloat(formData.reward_amount) : 0,
      status: 'assigned',
      created_at: new Date().toISOString(),
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    };

    onSubmit(taskData);
  };

  const renderFormField = (
    label: string,
    field: string,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric' | 'email-address';
      maxLength?: number;
    } = {}
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[
            styles.textInput,
            options.multiline && styles.multilineInput,
            errors[field] && styles.errorInput
          ]}
          value={formData[field as keyof typeof formData] as string}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          multiline={options.multiline}
          keyboardType={options.keyboardType || 'default'}
          maxLength={options.maxLength}
          editable={!loading}
        />
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  const renderPrioritySelector = () => {
    const priorities = [
      { value: 'low', label: 'Low', color: '#34C759', icon: 'arrow-down' },
      { value: 'medium', label: 'Medium', color: '#FF9500', icon: 'remove' },
      { value: 'high', label: 'High', color: '#FF3B30', icon: 'arrow-up' }
    ];

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Priority</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.value}
              style={[
                styles.priorityOption,
                formData.priority === priority.value && styles.selectedPriority,
                { borderColor: priority.color }
              ]}
              onPress={() => handleInputChange('priority', priority.value)}
              disabled={loading}
            >
              <Ionicons
                name={priority.icon as any}
                size={16}
                color={formData.priority === priority.value ? priority.color : '#8E8E93'}
              />
              <Text style={[
                styles.priorityText,
                formData.priority === priority.value && { color: priority.color }
              ]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRewardSection = () => {
    const currencies = ['eTask', 'XRP'];

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Reward (Optional)</Text>
        <View style={styles.rewardContainer}>
          <TextInput
            style={[
              styles.textInput,
              styles.rewardAmountInput,
              errors.reward_amount && styles.errorInput
            ]}
            value={formData.reward_amount}
            onChangeText={(value) => handleInputChange('reward_amount', value)}
            placeholder="0"
            placeholderTextColor="#8E8E93"
            keyboardType="numeric"
            editable={!loading}
          />
          <View style={styles.currencySelector}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyOption,
                  formData.reward_currency === currency && styles.selectedCurrency
                ]}
                onPress={() => handleInputChange('reward_currency', currency)}
                disabled={loading}
              >
                <Text style={[
                  styles.currencyText,
                  formData.reward_currency === currency && styles.selectedCurrencyText
                ]}>
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {errors.reward_amount && (
          <Text style={styles.errorText}>{errors.reward_amount}</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create New Task</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.submitButton, loading && styles.disabledButton]}
          disabled={loading}
        >
          <Text style={[styles.submitButtonText, loading && styles.disabledButtonText]}>
            {loading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {renderFormField('Task Title', 'title', 'Enter task title...', { maxLength: 100 })}
        
        {renderFormField('Description', 'description', 'Enter task description...', { 
          multiline: true, 
          maxLength: 500 
        })}

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Assign To</Text>
          <ChildSelector
            parentId={user?.uid || ''}
            selectedChildren={formData.assigned_to_ids}
            onSelectionChange={handleChildSelectionChange}
            placeholder="Select children for this task"
            allowMultiple={true}
            showAllOption={true}
            disabled={loading}
          />
          {errors.assigned_to_ids && (
            <Text style={styles.errorText}>{errors.assigned_to_ids}</Text>
          )}
        </View>

        {renderFormField('Due Date (Optional)', 'due_date', 'YYYY-MM-DD')}

        {renderPrioritySelector()}

        {renderRewardSection()}

        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.createButtonText}>Creating Task...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Task</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  submitButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  selectedPriority: {
    backgroundColor: '#F0F9FF',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 4,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardAmountInput: {
    flex: 1,
    marginRight: 12,
  },
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
  },
  currencyOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectedCurrency: {
    backgroundColor: '#007AFF',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  selectedCurrencyText: {
    color: '#FFFFFF',
  },
  submitSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CreateTaskForm;
