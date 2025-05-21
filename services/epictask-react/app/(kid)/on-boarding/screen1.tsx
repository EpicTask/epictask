
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
import { KIDOnboardingSlider } from "@/constants/on-boarding-slides";

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
    if (currentIndex < KIDOnboardingSlider.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      router.push("/(kid)/auth/login");
    }
  };

  const handleSkipPress = () => {
    router.push("/(kid)/auth/login");
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={KIDOnboardingSlider}
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
            <Paginator data={KIDOnboardingSlider} scrollX={scrollX} />

            <Text style={styles.title}>
              {KIDOnboardingSlider[currentIndex]?.title}
            </Text>
            <Text style={styles.description}>
              {KIDOnboardingSlider[currentIndex]?.description}
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
