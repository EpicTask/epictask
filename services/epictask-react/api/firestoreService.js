import { collection, query, where, getDocs, getFirestore,getDoc, doc } from "@react-native-firebase/firestore";
import { TestCollections } from "../constants/CollectionNames";

const db = getFirestore();
export const firestoreService = {
  // Fetch user profile by UID
  getUserProfile: async (uid) => {
    console.log("Fetching user profile for UID:", uid);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
  
      if (userDoc.exists()) {
        console.log("Firestore getUserProfile data:", userDoc.data());
        return { success: true, user: userDoc.data() };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      console.error("Firestore getUserProfile error:", error);
      throw new Error("Failed to fetch user profile from Firestore");
    }
  },

  getTasksForUser: async (uid) => {
    try {
      const tasksSnapshot = await getDocs(
        query(
          collection(db, TestCollections.Tasks),
          where("assignedTo", "==", uid)
        )
      );
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { success: true, tasks };
    } catch (error) {
      console.error("Firestore getTasksForUser error:", error);
      throw new Error("Failed to fetch tasks from Firestore");
    }
  },
};
