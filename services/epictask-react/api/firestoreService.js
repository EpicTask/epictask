import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getFirestore, 
  getDoc, 
  doc, 
  setDoc, 
  onSnapshot,
  orderBy,
  limit,
  startAfter
} from "@react-native-firebase/firestore";
import { TestCollections } from "../constants/CollectionNames";

const db = getFirestore();

// Task Cache for optimized performance
const TaskCache = {
  cache: new Map(),
  
  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < 300000) { // 5 minutes
      return item.data;
    }
    return null;
  },
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  clear() {
    this.cache.clear();
  }
};

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

  // Optimized child-centric task fetching
  getTasksForUser: async (uid, useCache = true) => {
    try {
      const cacheKey = `tasks:${uid}`;
      
      // Check cache first
      if (useCache) {
        const cachedTasks = TaskCache.get(cacheKey);
        if (cachedTasks) {
          return { success: true, tasks: cachedTasks, fromCache: true };
        }
      }

      const tasksSnapshot = await getDocs(
        query(
          collection(db, TestCollections.Tasks),
          where("assigned_to_ids", "array-contains", uid),
          orderBy("expiration_date", "desc"),
          limit(50)
        )
      );
      
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache the results
      if (useCache) {
        TaskCache.set(cacheKey, tasks);
      }

      return { success: true, tasks };
    } catch (error) {
      console.error("Firestore getTasksForUser error:", error);
      throw new Error("Failed to fetch tasks from Firestore");
    }
  },

  // Optimized family task fetching with parallel execution
  getTasksForFamily: async (parentUid) => {
    try {
      console.log("Fetching family tasks for parent UID:", parentUid);
      
      // Get parent's children
      const parentResult = await firestoreService.getUserProfile(parentUid);
      if (!parentResult.success) {
        return { success: false, error: "Parent not found" };
      }

      const childrenIds = parentResult.user.children || [];
      if (childrenIds.length === 0) {
        return { success: true, familyTasks: {} };
      }

      // Execute parallel queries for all children
      const taskPromises = childrenIds.map(async (childId) => {
        try {
          const result = await firestoreService.getTasksForUser(childId);
          return { childId, tasks: result.tasks || [] };
        } catch (error) {
          console.error(`Error fetching tasks for child ${childId}:`, error);
          return { childId, tasks: [], error: error.message };
        }
      });

      const results = await Promise.all(taskPromises);
      
      // Organize results by child
      const familyTasks = {};
      results.forEach(({ childId, tasks, error }) => {
        familyTasks[childId] = {
          tasks,
          error: error || null,
          lastUpdated: new Date().toISOString()
        };
      });

      return { success: true, familyTasks };
    } catch (error) {
      console.error("Firestore getTasksForFamily error:", error);
      throw new Error("Failed to fetch family tasks from Firestore");
    }
  },

  // Real-time task subscription for a single user
  subscribeToUserTasks: (uid, callback, options = {}) => {
    try {
      const { limitCount = 50, includeCompleted = true } = options;
      
      let taskQuery = query(
        collection(db, TestCollections.Tasks),
        where("assigned_to_ids", "array-contains", uid),
        orderBy("created_at", "desc"),
        limit(limitCount)
      );

      // Add status filter if needed
      if (!includeCompleted) {
        taskQuery = query(
          collection(db, TestCollections.Tasks),
          where("assigned_to_ids", "array-contains", uid),
          where("status", "!=", "completed"),
          orderBy("status"),
          orderBy("created_at", "desc"),
          limit(limitCount)
        );
      }

      const unsubscribe = onSnapshot(
        taskQuery,
        (snapshot) => {
          const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Update cache
          TaskCache.set(`tasks:${uid}`, tasks);
          
          callback({ success: true, tasks });
        },
        (error) => {
          console.error("Firestore subscribeToUserTasks error:", error);
          callback({ success: false, error: error.message });
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Firestore subscribeToUserTasks setup error:", error);
      throw new Error("Failed to setup task subscription");
    }
  },

  // Real-time family task subscription
  subscribeToFamilyTasks: (parentUid, callback) => {
    try {
      const unsubscribes = [];
      const familyTasks = {};

      // First get the parent's children
      firestoreService.getUserProfile(parentUid).then((parentResult) => {
        if (!parentResult.success) {
          callback({ success: false, error: "Parent not found" });
          return;
        }

        const childrenIds = parentResult.user.children || [];
        
        if (childrenIds.length === 0) {
          callback({ success: true, familyTasks: {} });
          return;
        }

        // Subscribe to each child's tasks
        childrenIds.forEach((childId) => {
          const unsubscribe = firestoreService.subscribeToUserTasks(
            childId,
            (result) => {
              if (result.success) {
                familyTasks[childId] = {
                  tasks: result.tasks,
                  error: null,
                  lastUpdated: new Date().toISOString()
                };
              } else {
                familyTasks[childId] = {
                  tasks: [],
                  error: result.error,
                  lastUpdated: new Date().toISOString()
                };
              }
              
              // Call the callback with updated family tasks
              callback({ success: true, familyTasks: { ...familyTasks } });
            }
          );
          
          unsubscribes.push(unsubscribe);
        });
      });

      // Return cleanup function
      return () => {
        unsubscribes.forEach(unsubscribe => unsubscribe());
      };
    } catch (error) {
      console.error("Firestore subscribeToFamilyTasks error:", error);
      throw new Error("Failed to setup family task subscription");
    }
  },

  // Paginated task fetching
  getTasksWithPagination: async (uid, lastDoc = null, limitCount = 20) => {
    try {
      let taskQuery = query(
        collection(db, TestCollections.Tasks),
        where("assigned_to_ids", "array-contains", uid),
        orderBy("created_at", "desc"),
        limit(limitCount)
      );

      if (lastDoc) {
        taskQuery = query(taskQuery, startAfter(lastDoc));
      }

      const tasksSnapshot = await getDocs(taskQuery);
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        _doc: doc // Keep reference for pagination
      }));

      const hasMore = tasks.length === limitCount;
      const lastDocument = tasks.length > 0 ? tasks[tasks.length - 1]._doc : null;

      return { 
        success: true, 
        tasks: tasks.map(({ _doc, ...task }) => task), // Remove _doc from returned data
        hasMore,
        lastDocument
      };
    } catch (error) {
      console.error("Firestore getTasksWithPagination error:", error);
      throw new Error("Failed to fetch paginated tasks from Firestore");
    }
  },

  // Clear task cache (useful for logout or data refresh)
  clearTaskCache: () => {
    TaskCache.clear();
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
