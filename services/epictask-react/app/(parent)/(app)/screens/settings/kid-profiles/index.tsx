import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import KidsCard from "@/components/cards/KidsCard";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import * as Clipboard from "expo-clipboard";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import authService from "@/api/authService";
import { useAuth } from "@/context/AuthContext";
import { TEEN_MIN_AGE, deviceSharingAllowed } from "@/constants/AgePolicy";

const CELL_COUNT = 4;

type Kid = {
  uid: string;
  displayName?: string;
  name?: string;
  age?: number;
  grade_level?: string;
  level?: number;
  stars?: number;
  completedTasksCount?: number;
  pendingTasksCount?: number;
};

type Invite = {
  code: string;
  child_name: string;
  age: number;
  child_email_masked?: string;
  expires_at?: string;
};

const ResetPinModal = ({
  kid,
  onClose,
  onSaved,
}: {
  kid: Kid | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ref = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: pin,
    setValue: setPin,
  });

  useEffect(() => {
    setPin("");
    setError("");
  }, [kid?.uid]);

  const save = async () => {
    if (pin.length !== CELL_COUNT) {
      setError("Enter 4 digits.");
      return;
    }
    if (/^(\d)\1{3}$/.test(pin)) {
      setError("Pick a PIN that isn't the same digit four times.");
      return;
    }
    if (!kid) return;

    try {
      setSaving(true);
      await authService.setChildPin(kid.uid, pin);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Couldn't update the PIN. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const firstName = (kid?.displayName || kid?.name || "your kid").split(" ")[0];

  return (
    <Modal
      visible={!!kid}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <CustomText variant="semiBold" style={styles.modalTitle}>
            New PIN for {firstName}
          </CustomText>
          <CustomText style={styles.modalBody}>
            This replaces their old PIN right away and clears any lockout.
          </CustomText>

          <CodeField
            ref={ref}
            {...props}
            value={pin}
            onChangeText={(v) => {
              setPin(v);
              setError("");
            }}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            InputComponent={TextInput}
            autoFocus
            editable={!saving}
            renderCell={({ index, symbol, isFocused }) => (
              <View
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                <CustomText variant="semiBold" style={styles.cellText}>
                  {symbol || (isFocused ? <Cursor /> : "")}
                </CustomText>
              </View>
            )}
          />

          {error ? (
            <CustomText style={styles.modalError}>{error}</CustomText>
          ) : null}

          <View style={styles.modalActions}>
            <View style={{ flex: 1 }}>
              <CustomButton
                fill={false}
                text="Cancel"
                onPress={onClose}
                height={responsiveHeight(6)}
                disabled={saving}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomButton
                fill={true}
                text={saving ? "Saving..." : "Save PIN"}
                onPress={save}
                height={responsiveHeight(6)}
                disabled={saving || pin.length !== CELL_COUNT}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const KidProfiles = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Kid[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetTarget, setResetTarget] = useState<Kid | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    try {
      const [childResult, inviteResult] = await Promise.all([
        authService.getLinkedChildren(user.uid, false),
        authService.getChildInvites(),
      ]);
      if (childResult?.success) setChildren(childResult.children || []);
      if (inviteResult?.success) setInvites(inviteResult.invites || []);
    } catch (error) {
      console.log("Error loading kid profiles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCancelInvite = (invite: Invite) => {
    Alert.alert(
      "Cancel this invite?",
      `${invite.child_name} won't be able to use code ${invite.code} any more. You can create a new one later.`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel invite",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.revokeChildInvite(invite.code);
              setInvites((prev) => prev.filter((i) => i.code !== invite.code));
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.message || "Couldn't cancel that invite.",
              );
            }
          },
        },
      ],
    );
  };

  const renderKid = ({ item }: { item: Kid }) => {
    const managed = deviceSharingAllowed(item.age);
    return (
      <View style={styles.kidRow}>
        <KidsCard
          name={item.displayName || item.name || "Kid"}
          level={item.level || 1}
          stars={item.stars || 0}
          completed={item.completedTasksCount || 0}
          pending={item.pendingTasksCount || 0}
          uid={item.uid}
        />
        <TouchableOpacity
          style={styles.kidAction}
          onPress={() =>
            managed
              ? setResetTarget(item)
              : Alert.alert(
                  "They manage their own PIN",
                  `${(item.displayName || "They").split(" ")[0]} is ${TEEN_MIN_AGE} or older, so they set their own PIN in Settings → Change PIN. If they're locked out of the app, they can reset their password from the sign-in screen.`,
                )
          }
        >
          <MaterialIcons
            name={managed ? "pin" : "info-outline"}
            size={15}
            color={COLORS.primary}
          />
          <CustomText variant="medium" style={styles.kidActionText}>
            {managed ? "Reset PIN" : "Own account"}
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading
        text="Kid Profiles"
        back={true}
        plus={true}
        plusPress={() => {
          router.push("/screens/add-kid" as any);
        }}
      />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: responsiveHeight(6) }}
        >
          {children.length > 0 ? (
            <FlatList
              numColumns={2}
              scrollEnabled={false}
              data={children}
              keyExtractor={(item) => item.uid}
              renderItem={renderKid}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="child-care"
                size={44}
                color={COLORS.light_grey}
              />
              <CustomText style={styles.emptyText}>
                No kid profiles yet. Tap + to add your first one.
              </CustomText>
            </View>
          )}

          {invites.length > 0 ? (
            <View style={{ marginTop: responsiveHeight(3) }}>
              <CustomText variant="semiBold" style={styles.sectionTitle}>
                Waiting to join
              </CustomText>
              <CustomText style={styles.sectionSubtitle}>
                These teens have a code but haven't signed up yet.
              </CustomText>

              {invites.map((invite) => (
                <View key={invite.code} style={styles.inviteCard}>
                  <View style={{ flex: 1 }}>
                    <CustomText variant="semiBold" style={styles.inviteName}>
                      {invite.child_name}
                    </CustomText>
                    <CustomText style={styles.inviteMeta}>
                      {invite.child_email_masked}
                      {invite.expires_at
                        ? ` · expires ${new Date(
                            invite.expires_at,
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}`
                        : ""}
                    </CustomText>
                    <CustomText variant="bold" style={styles.inviteCode}>
                      {invite.code}
                    </CustomText>
                  </View>
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity
                      style={styles.inviteBtn}
                      onPress={() => handleCopy(invite.code)}
                    >
                      <MaterialIcons
                        name={
                          copiedCode === invite.code ? "check" : "content-copy"
                        }
                        size={16}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inviteBtn}
                      onPress={() => handleCancelInvite(invite)}
                    >
                      <MaterialIcons
                        name="close"
                        size={16}
                        color={COLORS.red}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}

      <ResetPinModal
        kid={resetTarget}
        onClose={() => setResetTarget(null)}
        onSaved={() =>
          Alert.alert("PIN updated", "Their new PIN works right away.")
        }
      />
    </SafeAreaView>
  );
};

export default KidProfiles;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  kidRow: {
    flex: 1,
    padding: 4,
  },
  kidAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 6,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.light_grey,
  },
  kidActionText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: responsiveHeight(8),
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.black,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginTop: 2,
    marginBottom: 10,
  },
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  inviteName: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
  },
  inviteMeta: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 2,
  },
  inviteCode: {
    fontSize: FONT_SIZES.large,
    letterSpacing: 3,
    color: COLORS.primary,
    marginTop: 6,
  },
  inviteBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light_grey,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: responsiveWidth(85),
    padding: responsiveWidth(5),
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
  },
  modalBody: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 20,
  },
  codeFieldRoot: {
    marginTop: 10,
    justifyContent: "space-between",
    width: responsiveWidth(58),
  },
  cell: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  focusCell: {
    borderColor: COLORS.primary,
    backgroundColor: "#f3f4f6",
  },
  cellText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
  },
  modalError: {
    fontSize: FONT_SIZES.small,
    color: COLORS.red,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    alignSelf: "stretch",
  },
});
