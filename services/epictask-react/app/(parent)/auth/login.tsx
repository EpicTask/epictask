import React, { useState } from "react";

import SafeArea from "@/components/SafeArea";
import Divider from "@/components/Divider/Divider";
import AuthButton from "@/components/buttons/AuthButton";
import CustomInput from "@/components/custom-input/CustomInput";

import { ICONS } from "@/assets";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import CustomText from "@/components/CustomText";

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  return (
    <SafeArea>
      <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
        <View style={{ flex: 1, flexDirection: "column", gap: 4 }}>
          <View style={{ paddingVertical: 12 }}>
            <CustomText
              variant="semiBold"
              style={{
                color: COLORS.primary,
                fontSize: responsiveFontSize(4.9),
              }}
            >
              Welcome!
            </CustomText>
            {/* <CustomText
              variant="semiBold"
              style={{ fontSize: responsiveFontSize(4.7), top: -14 }}
            >
              Back!
            </CustomText> */}
          </View>
          <View style={{paddingVertical: 12}}>
            {/* <CustomText
              variant="semiBold"
              style={{ fontSize: responsiveFontSize(2.7) }}
            >
              Login Now
            </CustomText> */}
          </View>
          <View style={{}}>
            <CustomInput
              placeholder="Enter email.."
              label="Your Email"
              value={email}
              onChangeText={setEmail}
            />
            <CustomInput
              label="Password"
              placeholder="Enter password..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <View style={{paddingVertical: 12}}></View>
            <View style={{ paddingTop: 28 }}>
              <AuthButton
                fill={true}
                onPress={() => {
                  router.push("/(app)/(tabs)" as any);
                }}
                text="Login"
              />
            </View>
          </View>
          <View
            style={{
              gap: 36,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ gap: 16 }}>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <TouchableOpacity>
                  <CustomText
                    variant="medium"
                    style={{
                      textDecorationLine: "underline",
                      color: COLORS.grey,
                    }}
                  >
                    Forgot Password?
                  </CustomText>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ flexDirection: "row", gap: 4 }}
                onPress={() => {
                  router.push("/auth/register" as any);
                }}
              >
                <CustomText
                  variant="medium"
                  style={{ color: COLORS.primary, fontWeight: "400" }}
                >
                  New Here?
                </CustomText>
                {ICONS.SPLASH.arrow}
                <CustomText
                  variant="semiBold"
                  style={{ color: COLORS.primary, fontWeight: "500" }}
                >
                  SignUp
                </CustomText>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 10, width: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 20,
                  width: "90%",
                }}
              >
                <Divider />
                <CustomText variant="medium" style={{ color: COLORS.grey }}>
                  Or Login With
                </CustomText>
                <Divider />
              </View>
              <View
                style={{
                  gap: 10,
                  width: "100%",
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <TouchableOpacity style={styles.sso} onPress={() => {}}>
                  {ICONS.google}
                  <CustomText>Google</CustomText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sso}>
                  {ICONS.apple}
                  <CustomText>Apple</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sso: {
    backgroundColor: COLORS.white,
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
});
