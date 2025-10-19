import apiClient from "./apiClient";
import { auth } from "../config/firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firestoreService } from "../api/firestoreService";

export const authService = {
  // Register a new user - now handles registration directly with Firebase
  register: async (email, password, displayName, role = "child") => {
    try {
      // Register directly with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: displayName,
      });

      // Get the ID token
      const token = await user.getIdToken();
      await AsyncStorage.setItem("authToken", token);

      // Create user document in Firestore with enhanced error handling
      const userData = {
        email: user.email,
        displayName: displayName,
        role: role,
      };
      
      const createProfileResult = await firestoreService.createUserProfile(user.uid, userData);
      if (!createProfileResult.success) {
        throw new Error("Failed to create user profile in database");
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: role,
        },
        token,
      };
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle Firebase Auth specific errors
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error("An account with this email already exists");
          case 'auth/invalid-email':
            throw new Error("Invalid email address");
          case 'auth/weak-password':
            throw new Error("Password should be at least 6 characters");
          case 'auth/network-request-failed':
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
        password
      );
      const uid = userCredential.user.uid;
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem("authToken", token);

      // Then get user profile from user management service with caching
      const profileResponse = await firestoreService.getUserProfile(uid, true);

      if (profileResponse.success) {
        return {
          success: true,
          user: profileResponse.user,
          token,
          fromCache: profileResponse.fromCache || false,
        };
      } else {
        // If profile fetch fails, return basic Firebase user info
        console.warn("Profile fetch failed, using basic Firebase user info:", profileResponse.error);
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

  // Logout user with cache cleanup
  logout: async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("authToken");
      
      // Clear all caches on logout to prevent data leakage
      firestoreService.cache.clear();
      
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear cache even if logout fails
      firestoreService.cache.clear();
      throw new Error("Logout failed");
    }
  },

  // Get current user profile with enhanced caching
  getCurrentUser: async (uid, useCache = true) => {
    try {
      const response = await firestoreService.getUserProfile(uid, useCache);
      return response;
    } catch (error) {
      console.error("Get current user error:", error);
      // Clear user cache on error to prevent stale data
      firestoreService.cache.invalidateUser(uid);
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

  // Create pending invite for child (new method)
  createPendingInvite: async (parentId, childData) => {
    try {
      // Generate invite code using existing user management service
      const inviteResponse = await apiClient.post("/users/generate-invite-code");
      const inviteCode = inviteResponse.data.inviteCode;

      // Create pending invite in Firestore
      const pendingInvite = {
        parent_id: parentId,
        child_name: childData.name,
        child_email: childData.email,
        age: parseInt(childData.age),
        grade_level: childData.gradeLevel,
        image: childData.image || null,
        pin_hash: childData.pinHash, // Should be hashed before calling this method
        invite_code: inviteCode,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending'
      };

      const result = await firestoreService.createPendingInvite(pendingInvite);
      
      if (result.success) {
        // Send email invite (this would integrate with your email service)
        // For now, we'll just return the invite code to be handled by the UI
        return {
          success: true,
          inviteCode: inviteCode,
          pendingInviteId: result.pendingInviteId,
          message: "Invite created successfully"
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Create pending invite error:", error);
      throw new Error(error.message || "Failed to create pending invite");
    }
  },

  // Get pending invites for parent
  getPendingInvites: async (parentId) => {
    try {
      const result = await firestoreService.getPendingInvites(parentId);
      return result;
    } catch (error) {
      console.error("Get pending invites error:", error);
      throw new Error("Failed to get pending invites");
    }
  },

  // Validate invite code and get pending invite data
  validateInviteCode: async (inviteCode) => {
    try {
      const result = await firestoreService.getPendingInviteByCode(inviteCode);
      if (result.success && result.pendingInvite) {
        // Check if invite has expired
        const expiresAt = new Date(result.pendingInvite.expires_at);
        const now = new Date();
        
        if (now > expiresAt) {
          return {
            success: false,
            error: "Invite code has expired"
          };
        }
        
        if (result.pendingInvite.status !== 'pending') {
          return {
            success: false,
            error: "Invite code has already been used"
          };
        }
        
        return result;
      } else {
        return {
          success: false,
          error: "Invalid invite code"
        };
      }
    } catch (error) {
      console.error("Validate invite code error:", error);
      throw new Error("Failed to validate invite code");
    }
  },

  // Complete child registration using invite code
  completeChildRegistration: async (inviteCode, password) => {
    try {
      // First validate the invite code
      const inviteResult = await authService.validateInviteCode(inviteCode);
      if (!inviteResult.success) {
        throw new Error(inviteResult.error);
      }

      const pendingInvite = inviteResult.pendingInvite;
      
      // Register the child with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        pendingInvite.child_email, 
        password
      );
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: pendingInvite.child_name,
      });

      // Get the ID token
      const token = await user.getIdToken();
      await AsyncStorage.setItem("authToken", token);

      // Create user document in Firestore with enhanced data
      const userData = {
        email: user.email,
        displayName: pendingInvite.child_name,
        role: "child",
        age: pendingInvite.age,
        grade_level: pendingInvite.grade_level,
        image: pendingInvite.image,
        pin_hash: pendingInvite.pin_hash,
        parent_id: pendingInvite.parent_id,
        device_sharing_enabled: pendingInvite.age < 16,
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const createProfileResult = await firestoreService.createUserProfile(user.uid, userData);
      if (!createProfileResult.success) {
        throw new Error("Failed to create user profile in database");
      }

      // Update pending invite status to completed
      await firestoreService.updateInviteStatus(pendingInvite.id, 'completed');

      // Link child to parent automatically
      await authService.linkChild(inviteCode);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: pendingInvite.child_name,
          role: "child",
          age: pendingInvite.age,
          grade_level: pendingInvite.grade_level,
          parent_id: pendingInvite.parent_id,
          device_sharing_enabled: pendingInvite.age < 16
        },
        token,
      };
    } catch (error) {
      console.error("Complete child registration error:", error);
      
      // Handle Firebase Auth specific errors
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error("An account with this email already exists");
          case 'auth/invalid-email':
            throw new Error("Invalid email address");
          case 'auth/weak-password':
            throw new Error("Password should be at least 6 characters");
          case 'auth/network-request-failed':
            throw new Error("Network error. Please check your connection");
          default:
            throw new Error(error.message || "Registration failed");
        }
      }
      
      throw new Error(error.message || "Registration failed");
    }
  },

  // Check if parent can switch to child view (age-based)
  canSwitchToChild: (childAge) => {
    return childAge < 16;
  },

  // Switch to child context with PIN verification
  switchToChildContext: async (childId, pin) => {
    try {
      const result = await firestoreService.verifyChildPIN(childId, pin);
      if (result.success) {
        // Store child context in session
        await AsyncStorage.setItem("childContext", JSON.stringify({
          childId: childId,
          timestamp: Date.now(),
          expires: Date.now() + (15 * 60 * 1000) // 15 minutes
        }));
        return { success: true, child: result.child };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Switch to child context error:", error);
      throw new Error("Failed to switch to child account");
    }
  },

  // Clear child context and return to parent view
  clearChildContext: async () => {
    try {
      await AsyncStorage.removeItem("childContext");
      return { success: true };
    } catch (error) {
      console.error("Clear child context error:", error);
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
      console.error("Get child context error:", error);
      return { success: false, error: "Failed to get child context" };
    }
  },

  // Get linked children (for parents) with enhanced caching
  getLinkedChildren: async (parentUid, useCache = true) => {
    try {
      const response = await firestoreService.getLinkedChildren(parentUid, useCache);
      return response;
    } catch (error) {
      console.error("Get linked children error:", error);
      // Clear related cache on error
      firestoreService.cache.invalidateUser(parentUid);
      throw new Error("Failed to get linked children");
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await apiClient.delete("/deleteAccount");
      await signOut(auth);
      await AsyncStorage.removeItem("authToken");
      return response.data;
    } catch (error) {
      console.error("Delete account error:", error);
      throw new Error("Failed to delete account");
    }
  },
};

export default authService;
