import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import CustomText from '@/components/CustomText';
import CustomButton from '@/components/buttons/CustomButton';
import { COLORS } from '@/constants/Colors';
import authService from '@/api/authService';
import { useAuth } from '@/context/AuthContext';

interface Child {
  uid: string;
  displayName: string;
  age: number;
  grade_level: string;
  device_sharing_enabled: boolean;
  canSwitchToChild?: boolean;
}

interface ChildSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onChildSelected: (child: Child) => void;
}

const ChildSelectionModal: React.FC<ChildSelectionModalProps> = ({
  visible,
  onClose,
  onChildSelected,
}) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    if (visible && user?.uid) {
      fetchChildren();
    }
  }, [visible, user?.uid]);

  const fetchChildren = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const result = await authService.getLinkedChildren(user.uid);
      
      if (result.success) {
        // Filter children who can use device sharing (under 16)
        const eligibleChildren = result.children.filter((child: Child) => 
          authService.canSwitchToChild(child.age)
        );
        setChildren(eligibleChildren);
      } else {
        Alert.alert('Error', 'Failed to load children');
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
  };

  const handleConfirmSelection = () => {
    if (selectedChild) {
      onChildSelected(selectedChild);
      setSelectedChild(null);
    }
  };

  const renderChildItem = ({ item }: { item: Child }) => (
    <TouchableOpacity
      style={[
        styles.childItem,
        selectedChild?.uid === item.uid && styles.selectedChildItem
      ]}
      onPress={() => handleChildSelect(item)}
    >
      <View style={styles.childInfo}>
        <CustomText variant="semiBold" style={styles.childName}>
          {item.displayName}
        </CustomText>
        <CustomText variant="regular" style={styles.childDetails}>
          Age {item.age} • Grade {item.grade_level}
        </CustomText>
      </View>
      <View style={[
        styles.selectionIndicator,
        selectedChild?.uid === item.uid && styles.selectedIndicator
      ]} />
    </TouchableOpacity>
  );

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
              Switch to Child Account
            </CustomText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CustomText variant="regular" style={styles.closeText}>✕</CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <CustomText variant="regular" style={styles.description}>
              Select which child account you'd like to switch to. Only children under 16 can use device sharing.
            </CustomText>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <CustomText variant="regular" style={styles.loadingText}>
                  Loading children...
                </CustomText>
              </View>
            ) : children.length === 0 ? (
              <View style={styles.emptyContainer}>
                <CustomText variant="regular" style={styles.emptyText}>
                  No children available for device sharing.
                  {'\n\n'}Children must be under 16 years old to use this feature.
                </CustomText>
              </View>
            ) : (
              <FlatList
                data={children}
                keyExtractor={(item) => item.uid}
                renderItem={renderChildItem}
                style={styles.childrenList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          <View style={styles.footer}>
            <CustomButton
              text="Cancel"
              fill={false}
              onPress={onClose}
              height={responsiveHeight(6)}
            />
            <CustomButton
              text="Continue"
              fill={true}
              onPress={handleConfirmSelection}
              height={responsiveHeight(6)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: responsiveWidth(90),
    maxHeight: responsiveHeight(80),
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    color: COLORS.primary,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: responsiveFontSize(2.5),
    color: COLORS.grey,
  },
  content: {
    flex: 1,
    padding: responsiveWidth(4),
  },
  description: {
    fontSize: responsiveFontSize(2),
    color: COLORS.grey,
    marginBottom: responsiveHeight(2),
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: responsiveFontSize(2),
    color: COLORS.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(4),
  },
  emptyText: {
    fontSize: responsiveFontSize(2),
    color: COLORS.grey,
    textAlign: 'center',
    lineHeight: 24,
  },
  childrenList: {
    flex: 1,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsiveWidth(4),
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedChildItem: {
    borderColor: COLORS.primary,
    backgroundColor: '#e3f2fd',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: responsiveFontSize(2.2),
    color: COLORS.primary,
    marginBottom: 4,
  },
  childDetails: {
    fontSize: responsiveFontSize(1.8),
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
    flexDirection: 'row',
    gap: 10,
    padding: responsiveWidth(4),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});

export default ChildSelectionModal;
