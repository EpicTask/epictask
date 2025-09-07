import { collection, query, where, getDocs, getFirestore, getDoc, doc, setDoc } from "@react-native-firebase/firestore";
import { TestCollections } from "../constants/CollectionNames";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const db = getFirestore();
export const firestoreService = {
  // Create user profile in Firestore
  createUserProfile: async (uid, userData) => {
    console.log("Creating user profile for UID:", uid, "with data:", userData);
    try {
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || "child",
        createdAt: new Date().toISOString(),
        children: userData.role === "parent" ? [] : undefined,
        parentId: userData.role === "child" ? null : undefined,
      });
      
      return { success: true, message: "User profile created successfully" };
    } catch (error) {
      console.error("Firestore createUserProfile error:", error);
      throw new Error("Failed to create user profile in Firestore");
    }
  },
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

  // Get linked children directly from user document
  getLinkedChildren: async (parentUid) => {
    console.log("Fetching linked children for parent UID:", parentUid);
    try {
      const userDoc = await getDoc(doc(db, "users", parentUid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const childrenIds = userData.children || [];
        
        if (childrenIds.length === 0) {
          return { success: true, children: [] };
        }

        // Fetch child user documents
        const childrenPromises = childrenIds.map(childId => 
          getDoc(doc(db, "users", childId))
        );
        
        const childrenDocs = await Promise.all(childrenPromises);
        const children = childrenDocs
          .filter(doc => doc.exists())
          .map(doc => ({ uid: doc.id, ...doc.data() }));

        return { success: true, children };
      } else {
        return { success: false, error: "Parent user not found" };
      }
    } catch (error) {
      console.error("Firestore getLinkedChildren error:", error);
      throw new Error("Failed to fetch linked children from Firestore");
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

  getAllUsers: async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      return { success: true, users };
    } catch (error) {
      console.error("Firestore getAllUsers error:", error);
      throw new Error("Failed to fetch all users from Firestore");
    }
  }
};
