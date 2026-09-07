import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { MaterialIcons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";
import { COLORS } from "@/constants/Colors";
import authService from "@/api/authService";
import { useAuth } from "@/context/AuthContext";
import {
  TEEN_MIN_AGE,
  deviceSharingAllowed,
  deviceSharingBlockedReason,
} from "@/constants/AgePolicy";

export interface SelectableChild {
  uid: string;
  displayName: string;
  age: number;
  grade_level: string;
  device_sharing_enabled?: boolean;
  canSwitchToChild?: boolean;
  blockedReason?: string | null;
}

interface ChildSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onChildSelected: (child: SelectableChild) => void;
}

/**
 * Decorate linked children with whether the parent may switch into them.
 * Exported so callers can run the same check before deciding to show this
 * modal at all (with one eligible child there's nothing to choose).
 */
export const withSwitchEligibility = (children: any[]): SelectableChild[] =>
  (children || []).map((child) => ({
    ...child,
    canSwitchToChild:
      deviceSharingAllowed(child.age) && child.device_sharing_enabled !== false,
    blockedReason: deviceSharingBlockedReason(child),
  }));

const ChildSelectionModal: React.FC<ChildSelectionModalProps> = ({
  visible,
  onClose,
  onChildSelected,
}) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<SelectableChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedChild, setSelectedChild] = useState<SelectableChild | null>(
    null,
  );

  useEffect(() => {
    if (visible && user?.uid) {
      setSelectedChild(null);
      fetchChildren();
    }
  }, [visible, user?.uid]);

  const fetchChildren = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setLoadError("");
      // Always read the current linked-child list when opening the selector.
      // A child may have been added since the parent's cached profile was read.
      const result = await authService.getLinkedChildrenWithSharing(
        user.uid,
        false,
      );

      if (result.success) {
        const decorated = withSwitchEligibility(result.children);
        // Switchable profiles first — the blocked teens are context, not choices.
        decorated.sort(
          (a, b) => Number(b.canSwitchToChild) - Number(a.canSwitchToChild),
        );
        setChildren(decorated);
      } else {
        setLoadError(
          "Couldn't load your kids. Pull down to refresh and try again.",
        );
      }
    } catch (error) {
      console.log("Error fetching children:", error);
      setLoadError(
        "Couldn't load your kids. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child: SelectableChild) => {
    if (!child.canSwitchToChild) return;
    setSelectedChild(child);
  };

  const handleConfirmSelection = () => {
    if (selectedChild) {
      onChildSelected(selectedChild);
      setSelectedChild(null);
    }
  };

  const renderChildItem = ({ item }: { item: SelectableChild }) => (
    <TouchableOpacity
      style={[
        styles.childItem,
        !item.canSwitchToChild && styles.disabledChildItem,
        selectedChild?.uid === item.uid && styles.selectedChildItem,
      ]}
      onPress={() => handleChildSelect(item)}
      disabled={!item.canSwitchToChild}
      accessibilityRole="radio"
      accessibilityState={{
        selected: selectedChild?.uid === item.uid,
        disabled: !item.canSwitchToChild,
      }}
    >
      <View style={styles.childInfo}>
        <CustomText variant="semiBold" style={styles.childName}>
          {item.displayName}
        </CustomText>
        <CustomText variant="regular" style={styles.childDetails}>
          Age {item.age} • Grade {item.grade_level}
        </CustomText>
        {item.blockedReason ? (
          <View style={styles.blockedRow}>
            <MaterialIcons name="smartphone" size={13} color={COLORS.grey} />
            <CustomText variant="regular" style={styles.blockedReason}>
              {item.blockedReason}
            </CustomText>
          </View>
        ) : null}
      </View>
      {item.canSwitchToChild ? (
        <View
          style={[
            styles.selectionIndicator,
            selectedChild?.uid === item.uid && styles.selectedIndicator,
          ]}
        />
      ) : (
        <MaterialIcons name="lock-outline" size={18} color="#c7c7c7" />
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="child-care" size={40} color={COLORS.light_grey} />
      <CustomText variant="regular" style={styles.emptyText}>
        {loadError ||
          "No kid profiles yet. Add one from your home screen to get started."}
      </CustomText>
    </View>
  );

  const switchableCount = children.filter((c) => c.canSwitchToChild).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <CustomText variant="semiBold" style={styles.title}>
              Switch to Kid Profile
            </CustomText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CustomText variant="regular" style={styles.closeText}>
                ✕
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <CustomText variant="regular" style={styles.description}>
              Pick whose profile to open on this device. Kids {TEEN_MIN_AGE} and
              over sign in with their own email instead.
            </CustomText>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <CustomText variant="regular" style={styles.loadingText}>
                  Loading profiles...
                </CustomText>
              </View>
            ) : children.length === 0 ? (
              renderEmpty()
            ) : (
              <>
                <FlatList
                  data={children}
                  keyExtractor={(item) => item.uid}
                  renderItem={renderChildItem}
                  style={styles.childrenList}
                  showsVerticalScrollIndicator={false}
                />
                {switchableCount === 0 ? (
                  <CustomText variant="regular" style={styles.allBlockedNote}>
                    None of your kids use a shared profile right now — they each
                    sign in with their own account.
                  </CustomText>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.footerButton}>
              <CustomButton
                text="Cancel"
                fill={false}
                onPress={onClose}
                height={responsiveHeight(6)}
              />
            </View>
            <View style={styles.footerButton}>
              <CustomButton
                text="Continue"
                fill={true}
                onPress={handleConfirmSelection}
                height={responsiveHeight(6)}
                disabled={!selectedChild}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: responsiveWidth(90),
    height: responsiveHeight(70),
    maxHeight: responsiveHeight(80),
    padding: 0,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: FONT_SIZES.extraLarge,
    color: COLORS.primary,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: FONT_SIZES.extraLarge,
    color: COLORS.grey,
  },
  content: {
    flex: 1,
    padding: responsiveWidth(4),
  },
  description: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginBottom: responsiveHeight(2),
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: responsiveWidth(4),
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 24,
  },
  allBlockedNote: {
    fontSize: 12,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
  childrenList: {
    flex: 1,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: responsiveWidth(4),
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedChildItem: {
    borderColor: COLORS.primary,
    backgroundColor: "#e3f2fd",
  },
  disabledChildItem: {
    opacity: 0.55,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
    marginBottom: 4,
  },
  childDetails: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
  },
  blockedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  blockedReason: {
    flex: 1,
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.grey,
  },
  selectedIndicator: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: responsiveWidth(4),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerButton: {
    flex: 1,
  },
});

export default ChildSelectionModal;
