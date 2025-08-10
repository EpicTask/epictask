import React, { ReactNode, useContext } from "react";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { router } from "expo-router";
import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import CustomText from "@/components/CustomText";
import LinkIcon from "@/assets/icons/Link";
import TaskIcon from "@/assets/icons/tab-bar/Task";
import { AuthContext } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

const ProfileCard = () => {
  const { user } = useContext(AuthContext);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: 25,
        justifyContent: "space-between",
        paddingVertical: 20,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          source={user?.photoURL ? { uri: user.photoURL } : IMAGES.profile}
          style={{ width: responsiveWidth(12), height: responsiveWidth(12), borderRadius: responsiveWidth(6) }}
        />
        <CustomText
          variant="semiBold"
          style={{ fontSize: responsiveFontSize(2.3) }}
        >
          {user?.displayName || 'Joshua Smith'}
        </CustomText>
      </View>
    </View>
  );
};

const SettingButton = ({
  text,
  onPress,
  icon,
}: {
  text: String;
  onPress?: () => void;
  icon: ReactNode;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 20,
          paddingHorizontal: 6,
          borderBottomWidth: 1,
          borderBottomColor: "#00000010",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {icon}
          <CustomText
            variant="semiBold"
            style={{ fontSize: responsiveFontSize(2.3) }}
          >
            {text}
          </CustomText>
        </View>
        <MaterialIcons name="keyboard-arrow-right" size={20} color="black" />
      </View>
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  const { setUser } = useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.replace('/auth');
    } catch (error) {
      Alert.alert("Sign Out Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 50 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <CustomText
            variant="semiBold"
            style={{ fontSize: responsiveFontSize(3), fontWeight: "500" }}
          >
            Settings
          </CustomText>
        </View>
        <View style={{ paddingVertical: 20, gap: 20 }}>
          <View>
            <ProfileCard />
          </View>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 40,
              paddingVertical: 20,
              paddingHorizontal: 20,
            }}
          >
            <SettingButton
              icon={ICONS.SETTINGS.user_avatar}
              text={"Avatar"}
              onPress={() => {
                router.push("/(kid)/(app)/screens/profile" as any);
              }}
            />
            <SettingButton
              icon={ICONS.basicInfo}
              text={"Basic Info"}
              onPress={() => {
                router.push("/(kid)/(app)/screens/profile" as any);
              }}
            />
            <SettingButton
              icon={<TaskIcon width={20} height={20} />}
              text={"Task Overview"}
              onPress={() => {
                router.push("/screens/settings/task-overview" as any);
              }}
            />
            <SettingButton
              icon={<LinkIcon height={20} width={20} />}
              text={"Linked Parent"}
              onPress={() => {
                router.push("/(kid)/(app)/screens/profile" as any);
              }}
            />
            <SettingButton
              icon={ICONS.SETTINGS.wallet}
              text={"Wallet"}
              onPress={() => {
                router.push("/screens/settings/wallet" as any);
              }}
            />
            <SettingButton
              icon={ICONS.changePin}
              text={"Change PIN"}
              onPress={() => {
                router.push("/screens/settings/change-pin" as any);
              }}
            />
            <CustomText
              style={{
                paddingVertical: 20,
                fontSize: responsiveFontSize(2),
                fontWeight: "500",
                color: COLORS.grey,
              }}
            >
              Help & Support
            </CustomText>
            <SettingButton
              icon={ICONS.SETTINGS.get_help}
              text={"Get Help"}
              onPress={() => {}}
            />
            <SettingButton
              icon={ICONS.SETTINGS.user}
              text={"Terms and Conditions"}
              onPress={() => {}}
            />
            <SettingButton
              icon={ICONS.SETTINGS.terms}
              text={"Who We Are"}
              onPress={() => {}}
            />
            <SettingButton
              icon={<MaterialIcons name="logout" size={24} color="red" />}
              text={"Sign Out"}
              onPress={handleSignOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});

export default ProfileScreen;
