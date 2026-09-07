import axios from "axios";
import userApiClient from "./userService";
import { auth } from "../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firestoreService } from "../api/firestoreService";
import MicroserviceUrls from "../constants/Microservices";
import { deviceSharingAllowed } from "../constants/AgePolicy";

// The invite preview and redeem endpoints are reached by a teen who has no
// account yet, so they deliberately bypass the authenticated client.
const publicUserClient = axios.create({
  baseURL: MicroserviceUrls.userManagement,
});

const apiMessage = (error, fallback) =>
  error?.response?.data?.detail || error?.message || fallback;

// How long a parent's switched-into-child session lasts before it drops back
// to parent mode on its own.
export const CHILD_SESSION_MS = 15 * 60 * 1000;

export const authService = {
  // Register a new user - now handles registration directly with Firebase
  register: async (email, password, displayName, role = "child") => {
    try {
      // Register directly with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: displayName,
      });

      // Create user document in Firestore with enhanced error handling
      const userData = {
        email: user.email,
        displayName: displayName,
        role: role,
      };

      const createProfileResult = await firestoreService.createUserProfile(
        user.uid,
        userData,
      );
      if (!createProfileResult.success) {
        throw new Error("Failed to create user profile in database");
      }

      // Send email verification
      try {
        await sendEmailVerification(user);
      } catch (evError) {
        console.warn("Failed to send verification email:", evError);
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: role,
        },
        // token,
      };
    } catch (error) {
      console.log("Registration error:", error);

      // Handle Firebase Auth specific errors
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            throw new Error("An account with this email already exists");
          case "auth/invalid-email":
            throw new Error("Invalid email address");
          case "auth/weak-password":
            throw new Error("Password should be at least 6 characters");
          case "auth/network-request-failed":
            throw new Error("Network error. Please check your connection");
          default:
            throw new Error(error.message || "Registration failed");
        }
      }

      throw new Error(error.message || "Registration failed");
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      // First authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      // Then get user profile from user management service with caching
      const profileResponse = await firestoreService.getUserProfile(uid, true);

      if (profileResponse.success) {
        return {
          success: true,
          user: profileResponse.user,
          // token,
          fromCache: profileResponse.fromCache || false,
        };
      } else {
        // If profile fetch fails, return basic Firebase user info
        console.warn(
          "Profile fetch failed, using basic Firebase user info:",
          profileResponse.error,
        );
        return {
          success: true,
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
          },
          // token,
        };
      }
    } catch (error) {
      console.log("Login error:", error);

      // Handle Firebase Auth specific errors
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            throw new Error("No account found with this email address");
          case "auth/wrong-password":
            throw new Error("Incorrect password");
          case "auth/invalid-email":
            throw new Error("Invalid email address");
          case "auth/user-disabled":
            throw new Error("This account has been disabled");
          case "auth/too-many-requests":
            throw new Error("Too many failed attempts. Please try again later");
          case "auth/network-request-failed":
            throw new Error("Network error. Please check your connection");
          default:
            throw new Error(error.message || "Login failed");
        }
      }

      // Handle API errors
      throw new Error(
        error.response?.data?.error || error.message || "Login failed",
      );
    }
  },

  // Send password reset email
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || "Failed to send reset email");
    }
  },

  // Sign out from Firebase. Local session cleanup is handled by the
  // AuthContext auth-state listener so there is one cleanup path.
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.log("Logout error:", error);
      throw new Error("Logout failed");
    }
  },

  // Get current user profile with enhanced caching
  getCurrentUser: async (uid, useCache = true) => {
    try {
      const response = await firestoreService.getUserProfile(uid, useCache);
      return response;
    } catch (error) {
      console.log("Get current user error:", error);
      // Clear user cache on error to prevent stale data
      firestoreService.cache.invalidateUser(uid);
      throw new Error("Failed to get user profile");
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      // Map frontend field names to backend field names (camelCase to snake_case)
      const mappedData = {};
      if (profileData.displayName)
        mappedData.display_name = profileData.displayName;
      if (profileData.imageUrl) mappedData.photo_url = profileData.imageUrl;
      if (profileData.photoURL) mappedData.photo_url = profileData.photoURL;

      // Also pass through any other fields like age, etc.
      Object.keys(profileData).forEach((key) => {
        if (!["displayName", "imageUrl", "photoURL"].includes(key)) {
          mappedData[key] = profileData[key];
        }
      });

      const response = await userApiClient.put("/profile", mappedData);
      const uid = auth.currentUser?.uid;
      if (uid) {
        firestoreService.cache.invalidateUser(uid);
      }
      return response.data;
    } catch (error) {
      console.log("Update profile error:", error);
      throw new Error("Failed to update profile");
    }
  },

  // Create an under-13 managed profile. No email, no password — the child
  // reaches it through the parent's session plus a PIN.
  createManagedChild: async (childData) => {
    try {
      const response = await userApiClient.post("/managed-child", childData);
      const result = response.data;
      if (result?.child?.parent_id) {
        firestoreService.cache.invalidateUser(result.child.parent_id);
      }
      return result;
    } catch (error) {
      console.log("Create managed child error:", error);
      throw new Error(apiMessage(error, "Failed to create child profile"));
    }
  },

  // Generate invite code (for kids)
  generateInviteCode: async () => {
    try {
      const response = await userApiClient.post("/invite-code");
      return response.data;
    } catch (error) {
      console.log("Generate invite code error:", error);
      throw new Error("Failed to generate invite code");
    }
  },

  // Link child account (for parents)
  linkChild: async (inviteCode) => {
    try {
      const response = await userApiClient.post("/link-child", {
        inviteCode,
      });
      return response.data;
    } catch (error) {
      console.log("Link child error:", error);
      throw new Error("Failed to link child account");
    }
  },

  // --- Teen (13+) invites -------------------------------------------------
  //
  // A parent issues a single-use code; the teen redeems it to create their own
  // email/password account. Both sides go through mono_service so the code is
  // validated, the family link is derived from the invite (not from whoever is
  // signed in), and a failed redeem can't strand a half-made login.

  createChildInvite: async ({
    displayName,
    age,
    gradeLevel,
    email,
    parentalConsentAt,
  }) => {
    try {
      const response = await userApiClient.post("/child-invite", {
        display_name: displayName,
        age: parseInt(age, 10),
        grade_level: gradeLevel,
        child_email: String(email || "")
          .trim()
          .toLowerCase(),
        parental_consent_at: parentalConsentAt || new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.log("Create child invite error:", error);
      throw new Error(apiMessage(error, "Failed to create invite"));
    }
  },

  getChildInvites: async () => {
    try {
      const response = await userApiClient.get("/child-invites");
      return response.data;
    } catch (error) {
      console.log("List child invites error:", error);
      return { success: false, invites: [] };
    }
  },

  revokeChildInvite: async (code) => {
    try {
      const response = await userApiClient.delete(
        `/child-invite/${encodeURIComponent(String(code).trim().toUpperCase())}`,
      );
      return response.data;
    } catch (error) {
      console.log("Revoke child invite error:", error);
      throw new Error(apiMessage(error, "Failed to cancel invite"));
    }
  },

  // Look up an invite from the teen join screen. No account required.
  previewChildInvite: async (code) => {
    const cleaned = String(code || "")
      .trim()
      .toUpperCase();
    if (!cleaned) {
      return { success: false, error: "Enter the code your parent gave you." };
    }
    try {
      const response = await publicUserClient.get(
        `/child-invite/${encodeURIComponent(cleaned)}`,
      );
      return response.data;
    } catch (error) {
      if (error?.response) {
        return {
          success: false,
          error: apiMessage(error, "Invalid invite code"),
        };
      }
      return {
        success: false,
        error: "Couldn't reach EpicTask. Check your connection and try again.",
      };
    }
  },

  // Redeem an invite: the server creates the account, then we sign in with it.
  redeemChildInvite: async ({ code, email, password, pin, avatarKey }) => {
    const cleaned = String(code || "")
      .trim()
      .toUpperCase();
    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    let redeemed;
    try {
      const response = await publicUserClient.post(
        `/child-invite/${encodeURIComponent(cleaned)}/redeem`,
        { email: cleanEmail, password, pin, avatar_key: avatarKey || null },
      );
      redeemed = response.data;
    } catch (error) {
      console.log("Redeem child invite error:", error);
      throw new Error(
        apiMessage(error, "Could not complete signup. Please try again."),
      );
    }

    // The account now exists — sign in so the app has a session.
    await signInWithEmailAndPassword(auth, cleanEmail, password);
    firestoreService.cache.invalidateUser(redeemed.parent_id);

    return {
      success: true,
      user: {
        uid: redeemed.uid,
        email: cleanEmail,
        displayName: redeemed.display_name,
        role: "child",
        parent_id: redeemed.parent_id,
      },
      parentName: redeemed.parent_name,
      // token,
    };
  },

  // Verify child PIN via server
  verifyChildPIN: async (childId, pin) => {
    try {
      const response = await userApiClient.post("/verify-pin", {
        child_id: childId,
        pin: pin,
      });
      return response.data;
    } catch (error) {
      console.log("Verify child PIN error:", error);
      throw new Error(apiMessage(error, "Failed to verify PIN"));
    }
  },

  // Set or reset a PIN. A parent may do this for their own child; a teen for
  // themselves. Also clears any lockout.
  setChildPin: async (childId, pin) => {
    try {
      const response = await userApiClient.put("/child-pin", {
        child_id: childId,
        pin,
      });
      return response.data;
    } catch (error) {
      console.log("Set child PIN error:", error);
      throw new Error(apiMessage(error, "Failed to update PIN"));
    }
  },

  // Whether a parent may switch into this child's profile. See AgePolicy.
  canSwitchToChild: (childAge) => deviceSharingAllowed(childAge),

  // Switch to child context with PIN verification. Resolves to a result object
  // rather than throwing on a wrong PIN, so callers can distinguish "try again"
  // from "something broke".
  switchToChildContext: async (childId, pin) => {
    try {
      const result = await firestoreService.verifyChildPIN(childId, pin);
      if (!result.success) {
        return {
          success: false,
          error: result.error || "Invalid PIN",
          locked: result.locked,
        };
      }

      const child = result.child || {};
      const context = {
        childId,
        childName: child.displayName || child.display_name || "Kid",
        childImageUrl:
          child.imageUrl || child.photoURL || child.photo_url || null,
        childAvatarKey: child.avatar_key || child.avatarKey || null,
        childAge: child.age ?? null,
        childGradeLevel: child.grade_level ?? child.gradeLevel ?? null,
        timestamp: Date.now(),
        expires: Date.now() + CHILD_SESSION_MS,
      };
      await AsyncStorage.setItem("childContext", JSON.stringify(context));
      return { success: true, child, context };
    } catch (error) {
      console.log("Switch to child context error:", error);
      return {
        success: false,
        error:
          error?.message || "Couldn't open that profile. Please try again.",
      };
    }
  },

  // Clear child context and return to parent view
  clearChildContext: async () => {
    try {
      await AsyncStorage.removeItem("childContext");
      return { success: true };
    } catch (error) {
      console.log("Clear child context error:", error);
      throw new Error("Failed to clear child context");
    }
  },

  // Get current child context if active
  getChildContext: async () => {
    try {
      const contextData = await AsyncStorage.getItem("childContext");
      if (contextData) {
        const context = JSON.parse(contextData);
        if (Date.now() < context.expires) {
          return { success: true, context };
        } else {
          // Context expired, clear it
          await authService.clearChildContext();
          return { success: false, error: "Session expired" };
        }
      }
      return { success: false, error: "No child context found" };
    } catch (error) {
      console.log("Get child context error:", error);
      return { success: false, error: "Failed to get child context" };
    }
  },

  // Get linked children (for parents) with enhanced caching
  getLinkedChildren: async (parentUid, useCache = true) => {
    try {
      const response = await firestoreService.getLinkedChildren(
        parentUid,
        useCache,
      );
      return response;
    } catch (error) {
      console.log("Get linked children error:", error);
      // Clear related cache on error
      firestoreService.cache.invalidateUser(parentUid);
      throw new Error("Failed to get linked children");
    }
  },

  getLinkedChildrenWithSharing: async (parentUid, useCache = true) => {
    try {
      return await firestoreService.getLinkedChildrenWithSharing(
        parentUid,
        useCache,
      );
    } catch (error) {
      console.log("Get linked children with sharing error:", error);
      throw new Error("Failed to get linked children");
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await userApiClient.delete("/account");
      await signOut(auth);
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("cachedUserProfile");
      await AsyncStorage.removeItem("childContext");
      return response.data;
    } catch (error) {
      console.log("Delete account error:", error);
      throw new Error("Failed to delete account");
    }
  },

  // Current Firebase ID token. The SDK refreshes it only when it has actually
  // expired, so this is safe to call on any code path.
  refreshToken: async () => {
    try {
      const { getToken } = await import("./apiClient");
      return await getToken();
    } catch (error) {
      console.log("Token refresh error:", error);
      throw new Error("Failed to refresh token");
    }
  },
};

export default authService;
