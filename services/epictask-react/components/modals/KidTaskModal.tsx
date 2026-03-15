import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../buttons/CustomButton";
import { COLORS } from "@/constants/Colors";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Timestamp } from "firebase/firestore";
import DebouncedTouchableOpacity from "../buttons/DebouncedTouchableOpacity";
import taskService from "@/api/taskService";

interface Task {
  task_title?: string;
  task_description?: string;
  reward?: number;
  reward_amount?: number;
  task_id: string;
  assigned_to_ids?: string[];
  status?: string;
  expiration_date?: number;
  timestamp?: Timestamp;
  user_id?: string;
  rewarded?: boolean;
  marked_completed?: boolean;
  notes?: string;
}

interface KidTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onComplete?: () => void;
  onRefresh?: () => void;
}

const KID_STATUSES = ["in_progress", "completed"];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return COLORS.light_green || "#4CAF50";
    case "in_progress":
      return COLORS.light_yellow || "#FF9800";
    case "pending":
      return COLORS.grey || "#9E9E9E";
    default:
      return COLORS.grey || "#9E9E9E";
  }
};

export const KidTaskModal: React.FC<KidTaskModalProps> = ({
  visible,
  task,
  onClose,
  onComplete,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<"view" | "modify">("view");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status || "in_progress");
      setComment("");
      setActiveTab("view");
    }
  }, [task]);

  if (!task) return null;

  const taskTitle = task.task_title || "Untitled Task";
  const taskDescription = task.task_description || "No description";
  const taskReward = task.reward_amount || task.reward || 0;
  const taskDueDate = task.expiration_date
    ? new Date(task.expiration_date).toLocaleDateString()
    : "No due date";
  const taskStatus = task.status || "pending";
  const isPendingReward = task.marked_completed === true && !task.rewarded;

  const handleSave = async () => {
    try {
      setLoading(true);

      // Update status if changed
      if (selectedStatus !== task.status) {
        await taskService.updateTask({
          ...task,
          status: selectedStatus,
          marked_completed: selectedStatus === "completed",
        });
      }

      // Add comment if provided
      if (comment.trim()) {
        await taskService.taskCommentAdded({
          task_id: task.task_id,
          comment: comment.trim(),
          user_id: task.user_id,
        });
      }

      Alert.alert("Success", "Task updated successfully");
      onRefresh?.();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update task. Please try again.");
      console.error("KidTaskModal save error:", error);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.detailLabel}>Reward:</Text>
          <Text style={styles.detailValue}>{taskReward} points</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due Date:</Text>
          <Text style={styles.detailValue}>{taskDueDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(taskStatus) },
            ]}
          >
            <Text style={styles.statusText}>
              {taskStatus.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>

        {task.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue}>{task.notes}</Text>
          </View>
        )}
      </View>

      {isPendingReward && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time-outline" size={20} color="#FF9800" />
          <Text style={styles.pendingBannerText}>
            Waiting for parent to approve and reward this task.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderModifyTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Task</Text>

        {/* Status Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Update Status</Text>
          <View style={styles.statusSelector}>
            {KID_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedStatus === status && styles.selectedStatusOption,
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === status && styles.selectedStatusOptionText,
                  ]}
                >
                  {status.replace("_", " ").toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Add a Comment</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell your parent how it's going..."
            multiline
            numberOfLines={4}
            maxLength={300}
          />
          <Text style={styles.charCount}>{comment.length}/300</Text>
        </View>

        <DebouncedTouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </DebouncedTouchableOpacity>
      </View>
    </ScrollView>
  );

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

          <Text style={styles.headerTitle}>Task Details</Text>

          <View style={styles.placeholder} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "view" && styles.activeTab]}
            onPress={() => setActiveTab("view")}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={
                activeTab === "view" ? COLORS.primary || "#007AFF" : "#8E8E93"
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "view" && styles.activeTabText,
              ]}
            >
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "modify" && styles.activeTab]}
            onPress={() => setActiveTab("modify")}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={
                activeTab === "modify"
                  ? COLORS.primary || "#007AFF"
                  : "#8E8E93"
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "modify" && styles.activeTabText,
              ]}
            >
              Update
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "view" ? renderViewTab() : renderModifyTab()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.bg || "#F1F6F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEBEC",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 32,
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: responsiveWidth(4),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
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
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
    padding: responsiveWidth(4),
  },
  section: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderColor: "#EAEBEC",
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#000",
    marginBottom: responsiveHeight(2),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    width: responsiveWidth(25),
    fontWeight: "500",
  },
  detailValue: {
    fontSize: FONT_SIZES.extraSmall,
    color: "#000",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.extraSmall,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: responsiveWidth(4),
    borderWidth: 1,
    borderColor: "#FFE0B2",
    marginBottom: responsiveHeight(2),
  },
  pendingBannerText: {
    fontSize: FONT_SIZES.extraSmall,
    color: "#E65100",
    flex: 1,
  },
  inputGroup: {
    marginBottom: responsiveHeight(2),
  },
  inputLabel: {
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: "500",
    color: "#000",
    marginBottom: responsiveHeight(1),
  },
  textInput: {
    backgroundColor: COLORS.bg || "#F1F6F9",
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.2),
    fontSize: FONT_SIZES.medium,
    color: "#000",
    borderWidth: 1,
    borderColor: "#EAEBEC",
  },
  multilineInput: {
    height: responsiveHeight(12),
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    textAlign: "right",
    marginTop: 4,
  },
  statusSelector: {
    flexDirection: "row",
    gap: responsiveWidth(2),
  },
  statusOption: {
    flex: 1,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(3),
    borderRadius: 10,
    backgroundColor: COLORS.bg || "#F1F6F9",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEBEC",
  },
  selectedStatusOption: {
    backgroundColor: COLORS.primary || COLORS.purple,
    borderColor: COLORS.primary || COLORS.purple,
  },
  statusOptionText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    fontWeight: "500",
  },
  selectedStatusOptionText: {
    color: "#FFFFFF",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveHeight(1.8),
    borderRadius: 12,
    backgroundColor: COLORS.primary || COLORS.purple,
    gap: 8,
    marginTop: responsiveHeight(1),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
});

export default KidTaskModal;
