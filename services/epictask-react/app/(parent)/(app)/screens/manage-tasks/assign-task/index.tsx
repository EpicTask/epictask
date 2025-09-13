import React, { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import CustomInput from "@/components/custom-input/CustomInput";
import ScreenHeading from "@/components/headings/ScreenHeading";
import { ChildSelector } from "@/components/forms/ChildSelector";
import { useAuth } from "@/context/AuthContext";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import CustomText from "@/components/CustomText";
import DateInput from "@/components/DateInput";
import taskService from "@/api/taskService";

const AssignTask = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    task_title: "Clean Your Room",
    task_description: "Make sure to tidy up and organize everything.",
    reward_amount: "25",
    assigned_to_ids: [] as string[],
    expiration_date: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChildSelectionChange = (selectedIds: string[]) => {
    setTaskData(prev => ({
      ...prev,
      assigned_to_ids: selectedIds
    }));
  };

  const handleAssignTask = async () => {
    // Validate required fields
    if (!taskData.task_title.trim()) {
      alert("Please enter a task title");
      return;
    }
    
    if (!taskData.task_description.trim()) {
      alert("Please enter a task description");
      return;
    }
    
    if (taskData.assigned_to_ids.length === 0) {
      alert("Please select at least one child");
      return;
    }

    if (!taskData.reward_amount.trim()) {
      alert("Please enter a reward amount");
      return;
    }

    try {
      setLoading(true);
      
      // Create task data object matching TaskCreated model
      const newTask = {
        task_description: taskData.task_description,
        task_id: "", // Generated on backend
        expiration_date: taskData.expiration_date ? new Date(taskData.expiration_date).getTime() : Date.now() + (3 * 24 * 60 * 60 * 1000), // Default 7 days from now
        payment_method: "Pay Directly",
        reward_amount: parseFloat(taskData.reward_amount),
        reward_currency: "eTask",
        user_id: user?.uid || "",
        assigned_to_ids: taskData.assigned_to_ids,
        task_title: taskData.task_title,
      };

      console.log("Creating task:", newTask);
      
      await taskService.createTask(newTask);
      
      alert("Task created successfully!");
      router.back();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading back={true} plus={false} text="Assign A New Task" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 6 }}>
          <CustomInput
            label="Task Title"
            value={taskData.task_title}
            onChangeText={(value) => handleInputChange("task_title", value)}
            placeholder="Enter task title"
          />
          <CustomInput
            label="Task Description"
            value={taskData.task_description}
            onChangeText={(value) => handleInputChange("task_description", value)}
          />
          <DateInput title="Due Date (Optional)" />
          <CustomInput 
            label="Reward Amount" 
            value={taskData.reward_amount} 
            onChangeText={(value) => handleInputChange("reward_amount", value)} 
          />
          
          <View style={{ gap: 6, marginVertical: 8 }}>
            <CustomText variant="semiBold" style={{ fontWeight: "500" }}>
              Select Child
            </CustomText>
            <ChildSelector
              parentId={user?.uid || ''}
              selectedChildren={taskData.assigned_to_ids}
              onSelectionChange={handleChildSelectionChange}
              placeholder="Select children for this task"
              allowMultiple={true}
              showAllOption={true}
              style={{ marginVertical: 0 }}
            />
          </View>
          
          <View>
            <CustomButton
              fill={true}
              onPress={handleAssignTask}
              text={loading ? "Creating Task..." : "Assign Task"}
              height={responsiveHeight(8)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignTask;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
