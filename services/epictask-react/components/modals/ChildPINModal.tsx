import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import CustomText from '@/components/CustomText';
import CustomButton from '@/components/buttons/CustomButton';
import { COLORS } from '@/constants/Colors';
import authService from '@/api/authService';

interface Child {
  uid: string;
  displayName: string;
  age: number;
  grade_level: string;
}

interface ChildPINModalProps {
  visible: boolean;
  child: Child | null;
  onClose: () => void;
  onSuccess: (child: Child) => void;
}

const ChildPINModal: React.FC<ChildPINModalProps> = ({
  visible,
  child,
  onClose,
  onSuccess,
}) => {
  const CELL_COUNT = 4;
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Clear PIN when modal opens/closes
  useEffect(() => {
    if (visible) {
      setValue('');
      setAttempts(0);
      setLockoutUntil(null);
      setTimeRemaining(0);
    }
  }, [visible]);

  // Handle lockout timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (lockoutUntil && timeRemaining > 0) {
      interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((lockoutUntil.getTime() - now.getTime()) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setLockoutUntil(null);
          setAttempts(0);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutUntil, timeRemaining]);

  const handlePINSubmit = async () => {
    if (!child || value.length !== 4) return;
    
    // Check if user is locked out
    if (lockoutUntil && new Date() < lockoutUntil) {
      Alert.alert('Too Many Attempts', `Please wait ${timeRemaining} seconds before trying again.`);
      return;
    }

    try {
      setLoading(true);
      const result = await authService.switchToChildContext(child.uid, value);
      
      if (result.success) {
        // Success - clear form and call onSuccess
        setValue('');
        setAttempts(0);
        setLockoutUntil(null);
        onSuccess(child);
      } else {
        // Failed attempt
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setValue(''); // Clear PIN on failure
        
        if (newAttempts >= 3) {
          // Lock out for 15 minutes after 3 failed attempts
          const lockoutTime = new Date(Date.now() + 15 * 60 * 1000);
          setLockoutUntil(lockoutTime);
          setTimeRemaining(15 * 60);
          Alert.alert(
            'Account Locked',
            'Too many incorrect attempts. Please wait 15 minutes before trying again.'
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `Please try again. ${3 - newAttempts} attempts remaining.`
          );
        }
      }
    } catch (error: any) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', error?.message || 'Failed to verify PIN');
      setValue('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValue('');
    setAttempts(0);
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLockedOut = lockoutUntil && new Date() < lockoutUntil;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <CustomText variant="semiBold" style={styles.title}>
              Enter PIN for {child?.displayName}
            </CustomText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <CustomText variant="regular" style={styles.closeText}>✕</CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.pinContainer}>
              <CustomText variant="regular" style={styles.description}>
                Enter your 4-digit PIN to access your account
              </CustomText>

              {isLockedOut ? (
                <View style={styles.lockoutContainer}>
                  <CustomText variant="semiBold" style={styles.lockoutTitle}>
                    Account Temporarily Locked
                  </CustomText>
                  <CustomText variant="regular" style={styles.lockoutText}>
                    Too many incorrect attempts.{'\n'}
                    Try again in: {formatTime(timeRemaining)}
                  </CustomText>
                </View>
              ) : (
                <>
                  <CodeField
                    ref={ref}
                    {...props}
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    InputComponent={TextInput}
                    testID="pin-input"
                    autoFocus
                    secureTextEntry
                    renderCell={({ index, symbol, isFocused }) => (
                      <View
                        key={index}
                        style={[styles.cell, isFocused && styles.focusCell]}
                        onLayout={getCellOnLayoutHandler(index)}
                      >
                        <CustomText style={styles.cellText}>
                          {symbol ? '●' : (isFocused ? <Cursor /> : '')}
                        </CustomText>
                      </View>
                    )}
                  />

                  {attempts > 0 && (
                    <CustomText variant="regular" style={styles.attemptsWarning}>
                      {3 - attempts} attempts remaining
                    </CustomText>
                  )}
                </>
              )}
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <CustomText variant="regular" style={styles.loadingText}>
                  Verifying PIN...
                </CustomText>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <CustomButton
              text="Cancel"
              fill={false}
              onPress={handleClose}
              height={responsiveHeight(6)}
            />
            <CustomButton
              text="Enter"
              fill={true}
              onPress={loading || isLockedOut ? () => {} : handlePINSubmit}
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
    width: responsiveWidth(85),
    maxHeight: responsiveHeight(70),
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
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: FONT_SIZES.extraLarge,
    color: COLORS.grey,
  },
  content: {
    padding: responsiveWidth(4),
    minHeight: responsiveHeight(25),
  },
  pinContainer: {
    alignItems: 'center',
    gap: responsiveHeight(3),
  },
  description: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    textAlign: 'center',
    marginBottom: responsiveHeight(2),
  },
  codeFieldRoot: {
    justifyContent: 'space-between',
    width: responsiveWidth(60),
  },
  cell: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    lineHeight: responsiveWidth(12) - 4,
    fontSize: FONT_SIZES.title,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    textAlign: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCell: {
    borderColor: COLORS.primary,
    backgroundColor: '#f3f4f6',
  },
  cellText: {
    fontSize: FONT_SIZES.title,
    textAlign: 'center',
    color: COLORS.primary,
  },
  attemptsWarning: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: responsiveHeight(1),
  },
  lockoutContainer: {
    alignItems: 'center',
    padding: responsiveWidth(4),
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  lockoutTitle: {
    fontSize: FONT_SIZES.medium,
    color: '#856404',
    marginBottom: 8,
  },
  lockoutText: {
    fontSize: FONT_SIZES.medium,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: responsiveHeight(2),
  },
  loadingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: responsiveWidth(4),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});

export default ChildPINModal;
