import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import ToggleButton from "@/components/toggle/ToggleButton";
import CustomButton from "@/components/buttons/CustomButton";
import CustomInput from "@/components/custom-input/CustomInput";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { ICONS } from "@/assets";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  ImageProps,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "@/components/CustomText";
import DateInput from "@/components/DateInput";

const Attatchment = ({
  onPress,
  file,
}: {
  onPress: () => void;
  file: ImageProps;
}) => {
  return (
    <View style={{ gap: 10 }}>
      <CustomText variant="semiBold" style={{ fontWeight: "500" }}>
        Attatchment
      </CustomText>
      <TouchableOpacity onPress={onPress}>
        {file ? (
          <Image
            source={file}
            style={{ width: "100%", height: 120, borderRadius: 12 }}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 120,
              borderWidth: 1,
              borderColor: "#00000030",
              borderStyle: "dashed",
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {ICONS.SETTINGS.user}
            <CustomText variant="medium">Images, PDF, etc.</CustomText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const AssignTask = () => {
  const [file, setFile] = useState<any>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result?.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      } else if (result.canceled) {
        console.log("User cancelled the picker");
      }
    } catch (err) {
      console.error("Document pick error: ", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading back={true} plus={false} text="Assign A New Task" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 6 }}>
          <CustomInput
            label="Task Title"
            value={"Clean Your room"}
            onChangeText={() => {}}
          />
          <CustomInput
            label="Task Description"
            value={"Clean  your room"}
            onChangeText={() => {}}
          />
          <DateInput title="Age/Date of Birth" />
          <CustomInput label="Reward" value={`25`} onChangeText={() => {}} />
          <CustomInput
            label="Select Child"
            value={"Select Child"}
            onChangeText={() => {}}
          />
          <Attatchment onPress={pickDocument} file={file} />
          <View style={{ gap: 8, paddingVertical: 10 }}>
            <View style={{ paddingVertical: 10 }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: responsiveFontSize(2) }}
              >
                Repeat Task
              </CustomText>
            </View>
            <View style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <CustomText>One Only</CustomText>
                <ToggleButton />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <CustomText>Daily</CustomText>
                <ToggleButton />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <CustomText>Weekly</CustomText>
                <ToggleButton />
              </View>
            </View>
          </View>
          <View>
            <CustomButton
              fill={true}
              onPress={() => {
                router.back();
              }}
              text="Assign"
              height={responsiveHeight(8)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignTask;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
