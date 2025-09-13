import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestoreService } from '../../api/firestoreService';

interface Child {
  uid: string;
  displayName: string;
  email?: string;
  role: string;
}

interface ChildSelectorProps {
  parentId: string;
  selectedChildren: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  allowMultiple?: boolean;
  showAllOption?: boolean;
  style?: any;
  disabled?: boolean;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  parentId,
  selectedChildren,
  onSelectionChange,
  placeholder = "Select child(ren)",
  allowMultiple = true,
  showAllOption = true,
  style,
  disabled = false
}) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allChildrenSelected, setAllChildrenSelected] = useState(false);

  // Fetch linked children
  useEffect(() => {
    const fetchChildren = async () => {
      if (!parentId) {
        setChildren([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await firestoreService.getLinkedChildren(parentId);
        
        if (result.success) {
          setChildren(result.children || []);
        } else {
          setError(result.error || 'Failed to fetch children');
          setChildren([]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children');
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [parentId]);

  // Check if all children are selected
  useEffect(() => {
    if (children.length > 0) {
      const allSelected = children.every(child => selectedChildren.includes(child.uid));
      setAllChildrenSelected(allSelected);
    }
  }, [selectedChildren, children]);

  const handleChildToggle = (childId: string) => {
    if (!allowMultiple) {
      // Single selection mode
      onSelectionChange([childId]);
      setModalVisible(false);
      return;
    }

    // Multiple selection mode
    let newSelection: string[];
    
    if (selectedChildren.includes(childId)) {
      // Remove child from selection
      newSelection = selectedChildren.filter(id => id !== childId);
    } else {
      // Add child to selection
      newSelection = [...selectedChildren, childId];
    }
    
    onSelectionChange(newSelection);
  };

  const handleAllChildrenToggle = () => {
    if (allChildrenSelected) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all
      const allChildIds = children.map(child => child.uid);
      onSelectionChange(allChildIds);
    }
  };

  const getDisplayText = () => {
    if (loading) return 'Loading children...';
    if (error) return 'Error loading children';
    if (children.length === 0) return 'No children linked';
    
    if (selectedChildren.length === 0) {
      return placeholder;
    }
    
    if (allChildrenSelected && showAllOption) {
      return 'All Children';
    }
    
    if (selectedChildren.length === 1) {
      const child = children.find(c => c.uid === selectedChildren[0]);
      return child?.displayName || 'Selected child';
    }
    
    return `${selectedChildren.length} children selected`;
  };

  const renderChildItem = ({ item }: { item: Child }) => {
    const isSelected = selectedChildren.includes(item.uid);
    
    return (
      <TouchableOpacity
        style={[styles.childItem, isSelected && styles.selectedChildItem]}
        onPress={() => handleChildToggle(item.uid)}
        activeOpacity={0.7}
      >
        <View style={styles.childInfo}>
          <Text style={[styles.childName, isSelected && styles.selectedChildName]}>
            {item.displayName}
          </Text>
          {item.email && (
            <Text style={[styles.childEmail, isSelected && styles.selectedChildEmail]}>
              {item.email}
            </Text>
          )}
        </View>
        
        <View style={styles.checkboxContainer}>
          {allowMultiple ? (
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? '#007AFF' : '#8E8E93'}
            />
          ) : (
            <Ionicons
              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={isSelected ? '#007AFF' : '#8E8E93'}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAllChildrenOption = () => {
    if (!showAllOption || !allowMultiple || children.length <= 1) return null;
    
    return (
      <TouchableOpacity
        style={[styles.childItem, styles.allChildrenItem, allChildrenSelected && styles.selectedChildItem]}
        onPress={handleAllChildrenToggle}
        activeOpacity={0.7}
      >
        <View style={styles.childInfo}>
          <Text style={[styles.childName, styles.allChildrenText, allChildrenSelected && styles.selectedChildName]}>
            All Children
          </Text>
          <Text style={[styles.childEmail, allChildrenSelected && styles.selectedChildEmail]}>
            Select all {children.length} children
          </Text>
        </View>
        
        <View style={styles.checkboxContainer}>
          <Ionicons
            name={allChildrenSelected ? 'checkbox' : 'square-outline'}
            size={24}
            color={allChildrenSelected ? '#007AFF' : '#8E8E93'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.disabledSelector,
          error && styles.errorSelector
        ]}
        onPress={() => !disabled && !loading && children.length > 0 && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled || loading || children.length === 0}
      >
        <Text style={[
          styles.selectorText,
          disabled && styles.disabledText,
          (selectedChildren.length === 0 || error) && styles.placeholderText
        ]}>
          {getDisplayText()}
        </Text>
        
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? '#C7C7CC' : '#8E8E93'}
        />
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {allowMultiple ? 'Select Children' : 'Select Child'}
            </Text>
            
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={children}
            keyExtractor={(item) => item.uid}
            renderItem={renderChildItem}
            ListHeaderComponent={renderAllChildrenOption}
            style={styles.childList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabledSelector: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  errorSelector: {
    borderColor: '#FF3B30',
  },
  selectorText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  disabledText: {
    color: '#8E8E93',
  },
  placeholderText: {
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  childList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedChildItem: {
    backgroundColor: '#E3F2FD',
  },
  allChildrenItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5EA',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  selectedChildName: {
    color: '#007AFF',
  },
  allChildrenText: {
    fontWeight: '600',
  },
  childEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedChildEmail: {
    color: '#5A9FD4',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 16,
  },
});

export default ChildSelector;
