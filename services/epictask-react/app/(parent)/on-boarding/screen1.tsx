import { FONT_SIZES } from "@/constants/FontSize";
// import React from "react";
// import CustomText from "@/components/CustomText";

// import {
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import {
//   responsiveFontSize,
//   responsiveHeight,
//   responsiveWidth,
// } from "react-native-responsive-dimensions";

// import { IMAGES } from "@/assets";
// import { router } from "expo-router";
// import { COLORS } from "@/constants/Colors";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Paginator from "@/components/common/paginator/Paginator";

// const Screen1 = () => {
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={{ flex: 1 }}>
//           <View
//             style={{
//               width: responsiveWidth(100),
//               height: responsiveHeight(100),
//               backgroundColor: COLORS.primary,
//             }}
//           >
//             <Image
//               source={IMAGES.ob_p_1}
//               style={{
//                 width: responsiveWidth(100),
//                 height: responsiveHeight(100),
//               }}
//             />
//           </View>
//           <View
//             style={{
//               position: "absolute",
//               bottom: 0,
//               left: -responsiveWidth(25),
//               backgroundColor: "white",
//               width: responsiveWidth(150),
//               height: responsiveHeight(40),
//               borderTopRightRadius: 400,
//               borderTopLeftRadius: 400,
//             }}
//           >
//             <View
//               style={{
//                 position: "relative",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 paddingTop: 30,
//                 paddingHorizontal: responsiveWidth(10),
//               }}
//             >
//               <View style={{ width: responsiveWidth(70), gap: 10 }}>
//                 <View style={{ alignItems: "center" }}>
//                   <View
//                     style={{
//                       width: 10,
//                       height: 10,
//                       backgroundColor: "#000",
//                       borderRadius: 100,
//                     }}
//                   />
//                   {/* <Paginator data={} /> */}
//                 </View>
//                 <CustomText
//                   variant="semiBold"
//                   style={{
//                     fontSize: FONT_SIZES.title,
//                     textAlign: "center",
//                     paddingHorizontal: 20,
//                   }}
//                 >
//                   Here's your dashboard
//                 </CustomText>
//                 <CustomText
//                   style={{
//                     textAlign: "center",
//                     color: COLORS.grey,
//                     fontSize: FONT_SIZES.extraSmall,
//                   }}
//                   variant="medium"
//                 >
//                   Track your child's progress, tasks, and rewards from one
//                   place!
//                 </CustomText>
//                 <View
//                   style={{
//                     paddingVertical: 14,
//                     justifyContent: "space-between",
//                     flexDirection: "row",
//                     alignItems: "center",
//                     width: responsiveWidth(80),
//                     paddingHorizontal: 20,
//                   }}
//                 >
//                   <TouchableOpacity
//                     onPress={() => {
//                       router.push("/(parent)/auth/login");
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: COLORS.secondary,
//                         fontSize: FONT_SIZES.medium,
//                         fontWeight: "500",
//                       }}
//                     >
//                       Skip
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={() => {
//                       router.push("/(parent)/on-boarding/screen2");
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: COLORS.white,
//                         fontSize: FONT_SIZES.small,
//                         backgroundColor: COLORS.secondary,
//                         paddingHorizontal: 40,
//                         paddingVertical: 16,
//                         borderRadius: 30,
//                         fontWeight: "500",
//                       }}
//                     >
//                       Next
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Screen1;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#F1F6F9",
//     height: responsiveHeight(100),
//     width: responsiveWidth(100),
//   },
// });

import React, { useState, useRef } from "react";


import Paginator from "@/components/common/paginator/Paginator";
import OnboardingItem from "@/components/OnboardingItem/Onboarding";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { ParentOnboardingSlider } from "@/constants/on-boarding-slides";

const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<any> }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const handleNextPress = () => {
    if (currentIndex < ParentOnboardingSlider.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      router.push("/(parent)/auth/login");
    }
  };

  const handleSkipPress = () => {
    router.push("/(parent)/auth/login");
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={ParentOnboardingSlider}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: -responsiveWidth(38),
          backgroundColor: "white",
          width: responsiveWidth(175),
          height: responsiveHeight(42),
          borderTopRightRadius: 500,
          borderTopLeftRadius: 500,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={styles.bottomContainer}>
            <Paginator data={ParentOnboardingSlider} scrollX={scrollX} />

            <Text style={styles.title}>
              {ParentOnboardingSlider[currentIndex]?.title}
            </Text>
            <Text style={styles.description}>
              {ParentOnboardingSlider[currentIndex]?.description}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleSkipPress}
                style={[styles.button, styles.skipButton]}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextPress}
                style={[styles.button, styles.nextButton]}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  bottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: responsiveWidth(80),
    gap: 12
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 10,
    paddingHorizontal: 40,
    color: "#000",
    textAlign: "center",
  },
  description: {
    fontWeight: "300",
    fontSize: 14,
    color: "#62656b",
    textAlign: "center",
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  skipButton: {
    backgroundColor: "transparent",
  },
  nextButton: {
    backgroundColor: COLORS.secondary,
  },
  skipButtonText: {
    color: COLORS.secondary,
    fontWeight: "600",
    fontSize: 16,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default OnboardingScreen;
