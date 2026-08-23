import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import KidsCard from "@/components/cards/KidsCard";
import { router } from "expo-router";
import { firestoreService } from "@/api/firestoreService";
import { AuthContext } from "@/context/AuthContext";

const KidProfiles = () => {
  const { user, isSharedDeviceMode } = useContext(AuthContext);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiblings = async () => {
      const parentId =
        isSharedDeviceMode && user?.role === "parent"
          ? user.uid
          : user?.parent_id || user?.parentId;

      if (parentId) {
        try {
          const result = await firestoreService.getLinkedChildren(parentId);
          if (result.success) {
            setSiblings(result.children || []);
          }
        } catch (error) {
          console.log("Error fetching siblings:", error);
        }
      }
      setLoading(false);
    };

    fetchSiblings();
  }, [user, isSharedDeviceMode]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Kid Profiles" back={true} plus={false} />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#EE4266" />
          </View>
        ) : siblings.length > 0 ? (
          <FlatList
            numColumns={2}
            style={{ gap: 4, marginBottom: 50 }}
            data={siblings}
            keyExtractor={(item) => item.uid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
                <View style={{ padding: 4, flex: 1 }}>
                  <KidsCard
                    name={item.displayName || item.name || "Kid"}
                    level={item.level || 1}
                    stars={item.stars || 0}
                    completed={item.completedTasksCount || 0}
                    pending={item.pendingTasksCount || 0}
                    uid={item.uid}
                  />
                </View>
              );
            }}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 16, color: "#676767" }}>
              No other profiles found.
            </Text>
          </View>
        )}
      </View>
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
});
