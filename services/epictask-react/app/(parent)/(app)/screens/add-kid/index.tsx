import { FONT_SIZES } from "@/constants/FontSize";
import {
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
  Share,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useMemo, useState } from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/buttons/CustomButton";
import { MaterialIcons } from "@expo/vector-icons";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import CustomInput from "@/components/custom-input/CustomInput";
import CustomDropdown from "@/components/custom-dropdown/CustomDropdown";
import AvatarPicker from "@/components/avatar/AvatarPicker";
import { useAuth } from "@/context/AuthContext";
import authService from "@/api/authService";
import { COLORS } from "@/constants/Colors";
import * as Clipboard from "expo-clipboard";
import {
  AGE_OPTIONS,
  MIN_CHILD_AGE,
  MAX_CHILD_AGE,
  TEEN_MIN_AGE,
  isTeenAge,
} from "@/constants/AgePolicy";

export const gradeFromAge = (ageStr: string): string => {
  const age = parseInt(ageStr, 10);
  if (isNaN(age)) return "K";
  if (age <= 4) return "TK";
  if (age === 5) return "K";
  if (age >= 18) return "12";
  return (age - 5).toString();
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// The two signup paths diverge after the details step. Under-13s get a managed
// profile the parent sets up completely; teens get an invite they finish
// themselves, so the parent doesn't pick their avatar or their PIN.
type Step = "details" | "avatar" | "pin" | "review" | "done";

const MANAGED_STEPS: Step[] = ["details", "avatar", "pin", "done"];
const TEEN_STEPS: Step[] = ["details", "review", "done"];

const Checkbox = ({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) => (
  <TouchableOpacity
    style={styles.checkboxRow}
    onPress={onToggle}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
  >
    <MaterialIcons
      name={checked ? "check-box" : "check-box-outline-blank"}
      size={24}
      color={checked ? COLORS.primary : COLORS.grey}
    />
    <CustomText variant="medium" style={styles.checkboxLabel}>
      {label}
    </CustomText>
  </TouchableOpacity>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryRow}>
    <CustomText variant="medium" style={styles.summaryLabel}>
      {label}
    </CustomText>
    <CustomText variant="semiBold" style={styles.summaryValue}>
      {value}
    </CustomText>
  </View>
);

const AddKid = () => {
  const CELL_COUNT = 4;
  const { user } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [fullName, setFullName] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    "avatar1",
  );
  const [pin, setPin] = useState("");

  // Result state
  const [generatedCode, setGeneratedCode] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ref = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: pin,
    setValue: setPin,
  });

  const isTeen = isTeenAge(selectedAge);
  const steps = isTeen ? TEEN_STEPS : MANAGED_STEPS;
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const gradeLevelOptions = [
    "TK",
    "K",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const expiryLabel = useMemo(() => {
    if (!inviteExpiresAt) return "";
    const date = new Date(inviteExpiresAt);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [inviteExpiresAt]);

  const clearErrors = () => {
    setFormError("");
    setFieldErrors({});
  };

  const handleAgeChange = (age: string) => {
    setSelectedAge(age);
    setSelectedGradeLevel(gradeFromAge(age));
    // Switching bands changes which fields matter — drop anything now stale so
    // a teen's email can't linger on a profile that just became managed.
    if (!isTeenAge(age)) setChildEmail("");
    clearErrors();
  };

  const validateDetails = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Enter your child's name.";
    }
    if (!selectedAge) {
      errors.age = `Select an age between ${MIN_CHILD_AGE} and ${MAX_CHILD_AGE}.`;
    }
    if (!selectedGradeLevel) {
      errors.grade = "Select a grade level.";
    }
    if (isTeenAge(selectedAge) && !EMAIL_RE.test(childEmail.trim())) {
      errors.email = "Enter the email your teen will sign in with.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("");
      return false;
    }
    if (!consentGiven) {
      setFormError(
        "Please confirm you're this child's parent or legal guardian to continue.",
      );
      return false;
    }
    setFormError("");
    return true;
  };

  const goNext = () => {
    clearErrors();
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => {
    clearErrors();
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;
    await Clipboard.setStringAsync(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCode = async () => {
    if (!generatedCode) return;
    try {
      await Share.share({
        message:
          `${fullName}, join our EpicTask family! Open the app, tap "Teen/Child" → ` +
          `"I have an invite code", and enter ${generatedCode}. ` +
          `Use ${childEmail.trim().toLowerCase()} as your email.`,
      });
    } catch (e) {
      console.log("Share error:", e);
    }
  };

  // Under 13 — create the managed profile outright.
  const handleCreateManagedChild = async () => {
    if (pin.length !== 4) {
      setFormError("Enter a 4-digit PIN.");
      return;
    }
    if (/^(\d)\1{3}$/.test(pin)) {
      setFormError("Pick a PIN that isn't the same digit four times.");
      return;
    }
    if (!user?.uid) {
      setFormError("You've been signed out. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const result = await authService.createManagedChild({
        display_name: fullName.trim(),
        age: parseInt(selectedAge, 10),
        grade_level: selectedGradeLevel,
        pin,
        avatar_key: selectedAvatar,
        parental_consent_at: new Date().toISOString(),
      });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to create child profile");
      }

      setGeneratedCode("");
      setStepIndex(steps.indexOf("done"));
    } catch (error: any) {
      console.log("Add kid error:", error);
      setFormError(error?.message || "Failed to create child profile.");
    } finally {
      setLoading(false);
    }
  };

  // 13+ — issue a single-use invite the teen redeems themselves.
  const handleCreateInvite = async () => {
    if (!user?.uid) {
      setFormError("You've been signed out. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const result = await authService.createChildInvite({
        displayName: fullName.trim(),
        age: selectedAge,
        gradeLevel: selectedGradeLevel,
        email: childEmail,
        parentalConsentAt: new Date().toISOString(),
      });

      if (!result?.success || !result?.invite_code) {
        throw new Error("Failed to create invite. Please try again.");
      }

      setGeneratedCode(result.invite_code);
      setInviteExpiresAt(result.invite?.expires_at || null);
      setStepIndex(steps.indexOf("done"));
    } catch (error: any) {
      console.log("Create invite error:", error);
      setFormError(error?.message || "Failed to create invite.");
    } finally {
      setLoading(false);
    }
  };

  const renderDetails = () => (
    <View style={styles.stepBody}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <CustomInput
          label="First & Last Name"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            clearErrors();
          }}
          placeholder="Enter child's name"
          capitalizeFirstLetter={true}
          error={fieldErrors.fullName}
        />
        <CustomDropdown
          label="Age"
          value={selectedAge}
          options={AGE_OPTIONS}
          onSelect={handleAgeChange}
          placeholder={`Select age (${MIN_CHILD_AGE}-${MAX_CHILD_AGE})`}
        />
        {fieldErrors.age ? (
          <CustomText style={styles.inlineError}>{fieldErrors.age}</CustomText>
        ) : null}

        <CustomDropdown
          label="Grade Level"
          value={selectedGradeLevel}
          options={gradeLevelOptions}
          onSelect={(grade) => {
            setSelectedGradeLevel(grade);
            clearErrors();
          }}
          placeholder="Select grade level (TK-12)"
        />
        {fieldErrors.grade ? (
          <CustomText style={styles.inlineError}>
            {fieldErrors.grade}
          </CustomText>
        ) : (
          <CustomText style={styles.hint}>
            Filled in from age — change it if your child is in a different
            grade.
          </CustomText>
        )}

        {isTeen ? (
          <CustomInput
            label="Their Email"
            value={childEmail}
            onChangeText={(text) => {
              setChildEmail(text);
              clearErrors();
            }}
            placeholder="teen@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            error={fieldErrors.email}
            helperText="They'll sign in with this address. It has to match when they redeem the code."
          />
        ) : null}

        {selectedAge ? (
          <View style={styles.pathCallout}>
            <MaterialIcons
              name={isTeen ? "smartphone" : "family-restroom"}
              size={20}
              color={COLORS.primary}
            />
            <CustomText variant="medium" style={styles.pathCalloutText}>
              {isTeen
                ? `Age ${TEEN_MIN_AGE}+ gets their own account. We'll give you a code they redeem on their own device — they pick their password, avatar and PIN.`
                : `Under ${TEEN_MIN_AGE} gets a profile on your account. No email or password — you'll set a PIN and open it from your home screen.`}
            </CustomText>
          </View>
        ) : null}

        <Checkbox
          checked={consentGiven}
          onToggle={() => {
            setConsentGiven((v) => !v);
            setFormError("");
          }}
          label="I'm this child's parent or legal guardian and I consent to them using EpicTask."
        />
      </ScrollView>

      <CustomButton
        fill={true}
        onPress={() => {
          if (validateDetails()) goNext();
        }}
        text="Next"
        height={responsiveHeight(7)}
      />
    </View>
  );

  const renderAvatar = () => (
    <View style={styles.stepBody}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <CustomText variant="semiBold" style={styles.stepTitle}>
          Pick {fullName.split(" ")[0] || "their"} avatar
        </CustomText>
        <CustomText style={styles.stepSubtitle}>
          You can change this later from their profile.
        </CustomText>
        <AvatarPicker
          selectedAvatar={selectedAvatar}
          onSelectAvatar={(av) => setSelectedAvatar(av)}
        />
      </View>
      <View style={styles.buttonRow}>
        <View style={{ flex: 1 }}>
          <CustomButton
            fill={false}
            onPress={goBack}
            text="Back"
            height={responsiveHeight(7)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomButton
            fill={true}
            onPress={goNext}
            text="Next"
            height={responsiveHeight(7)}
          />
        </View>
      </View>
    </View>
  );

  const renderPin = () => (
    <View style={styles.stepBody}>
      <View style={{ flex: 1 }}>
        <CustomText variant="semiBold" style={styles.stepTitle}>
          Create {fullName.split(" ")[0] || "their"} PIN
        </CustomText>
        <CustomText style={styles.stepSubtitle}>
          They'll type this to open their profile on your device. You can reset
          it any time from Kid Profiles.
        </CustomText>
        <CodeField
          ref={ref}
          {...props}
          value={pin}
          onChangeText={(val) => {
            setPin(val);
            setFormError("");
          }}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          InputComponent={TextInput}
          testID="my-code-input"
          renderCell={({ index, symbol, isFocused }) => (
            <CustomText
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </CustomText>
          )}
        />
        {loading && (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>
      <View style={styles.buttonRow}>
        <View style={{ flex: 1 }}>
          <CustomButton
            fill={false}
            onPress={goBack}
            text="Back"
            height={responsiveHeight(7)}
            disabled={loading}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomButton
            fill={true}
            onPress={handleCreateManagedChild}
            text={loading ? "Creating..." : "Create Profile"}
            height={responsiveHeight(7)}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );

  const renderReview = () => (
    <View style={styles.stepBody}>
      <View style={{ flex: 1 }}>
        <CustomText variant="semiBold" style={styles.stepTitle}>
          Check before we send
        </CustomText>
        <CustomText style={styles.stepSubtitle}>
          The invite is single-use and tied to this email. If it's wrong, go
          back and fix it — a typo means the code won't work.
        </CustomText>

        <View style={styles.summaryCard}>
          <SummaryRow label="Name" value={fullName.trim()} />
          <SummaryRow label="Age" value={`${selectedAge} years old`} />
          <SummaryRow label="Grade" value={selectedGradeLevel} />
          <SummaryRow label="Email" value={childEmail.trim().toLowerCase()} />
        </View>

        {loading && (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>
      <View style={styles.buttonRow}>
        <View style={{ flex: 1 }}>
          <CustomButton
            fill={false}
            onPress={goBack}
            text="Back"
            height={responsiveHeight(7)}
            disabled={loading}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomButton
            fill={true}
            onPress={handleCreateInvite}
            text={loading ? "Creating..." : "Create Invite"}
            height={responsiveHeight(7)}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );

  const renderDone = () => (
    <View style={styles.stepBody}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", gap: 14, paddingVertical: 12 }}>
          <MaterialIcons name="check-circle" size={56} color={COLORS.success} />
          <CustomText variant="semiBold" style={styles.doneTitle}>
            {isTeen
              ? "Invite ready"
              : `${fullName.split(" ")[0]}'s profile is ready`}
          </CustomText>

          {isTeen ? (
            <>
              <CustomText style={styles.doneBody}>
                Send this code to {fullName.split(" ")[0]}. They'll open
                EpicTask, tap{" "}
                <CustomText variant="semiBold">
                  Teen/Child → I have an invite code
                </CustomText>
                , and sign up with{" "}
                <CustomText variant="semiBold">
                  {childEmail.trim().toLowerCase()}
                </CustomText>
                .
              </CustomText>

              <View style={styles.codeContainer}>
                <CustomText variant="bold" style={styles.codeText}>
                  {generatedCode}
                </CustomText>
              </View>

              {expiryLabel ? (
                <CustomText style={styles.expiryText}>
                  Expires {expiryLabel} · single use
                </CustomText>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleCopyCode}
                >
                  <MaterialIcons
                    name={copied ? "check" : "content-copy"}
                    size={18}
                    color={COLORS.primary}
                  />
                  <CustomText variant="medium" style={styles.actionBtnText}>
                    {copied ? "Copied" : "Copy"}
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={handleShareCode}
                >
                  <MaterialIcons
                    name="ios-share"
                    size={18}
                    color={COLORS.white}
                  />
                  <CustomText
                    variant="medium"
                    style={[styles.actionBtnText, { color: COLORS.white }]}
                  >
                    Share
                  </CustomText>
                </TouchableOpacity>
              </View>

              <CustomText style={styles.doneFootnote}>
                You can see or cancel this invite any time under Settings → Kid
                Profiles.
              </CustomText>
            </>
          ) : (
            <>
              <CustomText style={styles.doneBody}>
                Open it any time from your home screen — tap{" "}
                <CustomText variant="semiBold">
                  Switch to Kid Profile
                </CustomText>{" "}
                and enter their PIN.
              </CustomText>
              <CustomText style={styles.doneFootnote}>
                Under {TEEN_MIN_AGE} means no email and no password. Their
                session returns to your account automatically after 15 minutes.
              </CustomText>
            </>
          )}
        </View>
      </ScrollView>

      <CustomButton
        fill={true}
        onPress={() => router.back()}
        text="Done"
        height={responsiveHeight(7)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Add a Kid" back={true} plus={false} />

      {step !== "done" ? (
        <View style={styles.progressRow}>
          {steps.slice(0, -1).map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressPip,
                i <= stepIndex && styles.progressPipActive,
              ]}
            />
          ))}
        </View>
      ) : null}

      <View style={{ flex: 1, paddingVertical: 12 }}>
        {formError ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={18} color={COLORS.red} />
            <CustomText variant="medium" style={styles.errorBannerText}>
              {formError}
            </CustomText>
          </View>
        ) : null}

        {step === "details" && renderDetails()}
        {step === "avatar" && renderAvatar()}
        {step === "pin" && renderPin()}
        {step === "review" && renderReview()}
        {step === "done" && renderDone()}
      </View>
    </SafeAreaView>
  );
};

export default AddKid;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(6),
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  progressPip: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.light_grey,
  },
  progressPipActive: {
    backgroundColor: COLORS.primary,
  },
  stepBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  stepTitle: {
    fontSize: FONT_SIZES.title,
    color: COLORS.black,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginTop: 6,
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 6,
    marginLeft: 4,
  },
  inlineError: {
    fontSize: 12,
    color: COLORS.red,
    marginTop: 6,
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.red,
    fontSize: FONT_SIZES.small,
  },
  pathCallout: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: COLORS.light_purple,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  pathCalloutText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: COLORS.black,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 20,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  codeFieldRoot: { marginTop: 28, justifyContent: "space-between" },
  cell: {
    width: 70,
    height: 70,
    lineHeight: 68,
    fontSize: 24,
    borderWidth: 1,
    borderColor: COLORS.grey,
    backgroundColor: COLORS.white,
    textAlign: "center",
    borderRadius: 8,
    marginHorizontal: 1,
  },
  focusCell: {
    color: COLORS.white,
    backgroundColor: COLORS.primary,
  },
  summaryCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
  },
  summaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: FONT_SIZES.small,
    color: COLORS.black,
  },
  doneTitle: {
    fontSize: FONT_SIZES.title,
    color: COLORS.primary,
    textAlign: "center",
  },
  doneBody: {
    textAlign: "center",
    color: COLORS.grey,
    fontSize: FONT_SIZES.small,
    lineHeight: 22,
  },
  doneFootnote: {
    textAlign: "center",
    color: COLORS.grey,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  codeContainer: {
    backgroundColor: COLORS.light_purple,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 6,
  },
  codeText: {
    fontSize: 30,
    letterSpacing: 6,
    color: COLORS.primary,
  },
  expiryText: {
    fontSize: 12,
    color: COLORS.grey,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.light_grey,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
  },
});
