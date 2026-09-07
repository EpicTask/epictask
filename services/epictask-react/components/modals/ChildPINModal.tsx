import { FONT_SIZES } from "@/constants/FontSize";
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { MaterialIcons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";
import { COLORS } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

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

const CELL_COUNT = 4;

/**
 * PIN entry for switching into a managed child's profile.
 *
 * Attempt counting and lockout are enforced by mono_service and persisted in
 * Firestore, so they can't be reset by clearing app storage. This screen just
 * renders whatever the server says.
 */
const ChildPINModal: React.FC<ChildPINModalProps> = ({
  visible,
  child,
  onClose,
  onSuccess,
}) => {
  const { switchToChildContext } = useAuth();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedOut, setLockedOut] = useState(false);

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    if (visible) {
      setValue("");
      setError("");
      setLockedOut(false);
    }
  }, [visible, child?.uid]);

  const submit = async (pin: string) => {
    if (!child || pin.length !== CELL_COUNT || loading) return;

    setLoading(true);
    setError("");

    const result = await switchToChildContext(child.uid, pin);

    setLoading(false);

    if (result.success) {
      setValue("");
      onSuccess(child);
      return;
    }

    setValue("");
    setLockedOut(!!result.locked);
    setError(result.error || "That PIN isn't right.");
  };

  const handleChange = (next: string) => {
    setValue(next);
    if (error) setError("");
    // Submitting on the fourth digit saves a tap; a parent typing a PIN on a
    // shared device shouldn't have to reach for a button.
    if (next.length === CELL_COUNT) submit(next);
  };

  const handleClose = () => {
    setValue("");
    setError("");
    onClose();
  };

  const firstName = (child?.displayName || "your kid").split(" ")[0];

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
              {firstName}'s PIN
            </CustomText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <CustomText variant="regular" style={styles.closeText}>
                ✕
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <CustomText variant="regular" style={styles.description}>
              Enter the 4-digit PIN to open this profile.
            </CustomText>

            {lockedOut ? (
              <View style={styles.lockoutContainer}>
                <MaterialIcons name="lock-clock" size={26} color="#856404" />
                <CustomText variant="semiBold" style={styles.lockoutTitle}>
                  Locked for now
                </CustomText>
                <CustomText variant="regular" style={styles.lockoutText}>
                  {error}
                </CustomText>
              </View>
            ) : (
              <>
                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={handleChange}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  InputComponent={TextInput}
                  testID="pin-input"
                  autoFocus
                  secureTextEntry
                  editable={!loading}
                  renderCell={({ index, symbol, isFocused }) => (
                    <View
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      <CustomText style={styles.cellText}>
                        {symbol ? "●" : isFocused ? <Cursor /> : ""}
                      </CustomText>
                    </View>
                  )}
                />

                {error ? (
                  <CustomText variant="regular" style={styles.errorText}>
                    {error}
                  </CustomText>
                ) : null}

                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <CustomText variant="regular" style={styles.loadingText}>
                      Checking...
                    </CustomText>
                  </View>
                )}
              </>
            )}

            <CustomText style={styles.footnote}>
              Forgot it? Reset the PIN from Settings → Kid Profiles.
            </CustomText>
          </View>

          <View style={styles.footerButton}>
            <CustomButton
              text={lockedOut ? "Close" : "Cancel"}
              fill={false}
              onPress={handleClose}
              height={responsiveHeight(6)}
            />
            {!lockedOut && (
              <CustomButton
                text="Enter"
                fill={true}
                onPress={() => submit(value)}
                height={responsiveHeight(6)}
                disabled={loading || value.length !== CELL_COUNT}
              />
            )}
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
    width: responsiveWidth(85),
    maxHeight: responsiveHeight(75),
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
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
    flex: 1,
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
    padding: responsiveWidth(4),
    alignItems: "center",
    gap: responsiveHeight(2),
  },
  description: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    textAlign: "center",
  },
  codeFieldRoot: {
    justifyContent: "space-between",
    width: responsiveWidth(60),
  },
  cell: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  focusCell: {
    borderColor: COLORS.primary,
    backgroundColor: "#f3f4f6",
  },
  cellText: {
    fontSize: FONT_SIZES.title,
    textAlign: "center",
    color: COLORS.primary,
  },
  errorText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.red,
    textAlign: "center",
  },
  lockoutContainer: {
    alignItems: "center",
    gap: 6,
    padding: responsiveWidth(4),
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE69C",
  },
  lockoutTitle: {
    fontSize: FONT_SIZES.medium,
    color: "#856404",
  },
  lockoutText: {
    fontSize: FONT_SIZES.small,
    color: "#856404",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
  },
  footnote: {
    fontSize: 12,
    color: COLORS.grey,
    textAlign: "center",
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

export default ChildPINModal;
