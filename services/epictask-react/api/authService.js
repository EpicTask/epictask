import apiClient from "./apiClient";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firestoreService } from "../api/firestoreService";

export const authService = {
  // Register a new user
  register: async (email, password, displayName, role = "child") => {
    try {
      // First register with the user management service
      const response = await apiClient.post("/registerWithPassword", {
        email,
        password,
        displayName,
        role,
      });

      if (response.data.success) {
        // Then sign in with Firebase to get the token
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password
        );
        const token = await userCredential.user.getIdToken();
        await AsyncStorage.setItem("authToken", token);

        return {
          success: true,
          user: response.data.user,
          token,
        };
      }

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      // First authenticate with Firebase
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      const uid = userCredential.user.uid;
      console.log("Logged in Firebase UID:", uid);
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem("authToken", token);

      // Then get user profile from user management service
      const profileResponse = await firestoreService.getUserProfile(uid);
      console.log("Fetched user profile from Firestore:", profileResponse);

      if (profileResponse.success) {
        return {
          success: true,
          user: profileResponse.user,
          token,
        };
      } else {
        // If profile fetch fails, return basic Firebase user info
        return {
          success: true,
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
          },
          token,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle Firebase Auth specific errors
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            throw new Error("No account found with this email address");
          case 'auth/wrong-password':
            throw new Error("Incorrect password");
          case 'auth/invalid-email':
            throw new Error("Invalid email address");
          case 'auth/user-disabled':
            throw new Error("This account has been disabled");
          case 'auth/too-many-requests':
            throw new Error("Too many failed attempts. Please try again later");
          case 'auth/network-request-failed':
            throw new Error("Network error. Please check your connection");
          default:
            throw new Error(error.message || "Login failed");
        }
      }
      
      // Handle API errors
      throw new Error(error.response?.data?.error || error.message || "Login failed");
    }
  },

  // Logout user
  logout: async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem("authToken");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed");
    }
  },

  // Get current user profile
  getCurrentUser: async (uid) => {
    try {
      const response = (await firestoreService.getUserProfile(uid));
      console.log("Get current user authService:", response);
      return response;
    } catch (error) {
      console.error("Get current user error:", error);
      throw new Error("Failed to get user profile");
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/profileUpdate", profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error("Failed to update profile");
    }
  },

  // Generate invite code (for kids)
  generateInviteCode: async () => {
    try {
      const response = await apiClient.post("/users/generate-invite-code");
      return response.data;
    } catch (error) {
      console.error("Generate invite code error:", error);
      throw new Error("Failed to generate invite code");
    }
  },

  // Link child account (for parents)
  linkChild: async (inviteCode) => {
    try {
      const response = await apiClient.post("/users/link-child", {
        inviteCode,
      });
      return response.data;
    } catch (error) {
      console.error("Link child error:", error);
      throw new Error("Failed to link child account");
    }
  },

  // Get linked children (for parents)
  getLinkedChildren: async () => {
    try {
      const response = await apiClient.get("/users/me/children");
      return response.data;
    } catch (error) {
      console.error("Get linked children error:", error);
      throw new Error("Failed to get linked children");
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await apiClient.delete("/deleteAccount");
      await auth().signOut();
      await AsyncStorage.removeItem("authToken");
      return response.data;
    } catch (error) {
      console.error("Delete account error:", error);
      throw new Error("Failed to delete account");
    }
  },
};

export default authService;
