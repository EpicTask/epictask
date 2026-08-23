import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 *
 * @param {string} uri - Local URI of the image
 * @param {string} path - Storage path (e.g., 'avatars/uid.jpg')
 * @returns {Promise<string>} Permanent download URL
 */
export const storageService = {
  uploadImage: async (uri, path) => {
    try {
      // Fetch the file from the local URI
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a reference to the storage location
      const storageRef = ref(storage, path);

      // Upload the blob
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.log("Error uploading image to Firebase Storage:", error);
      throw new Error("Failed to upload image");
    }
  },
};

export default storageService;
