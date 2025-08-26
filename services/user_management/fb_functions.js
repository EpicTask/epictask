import * as dotenv from 'dotenv';
import { db } from './firebase_config.js';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  addDoc,
  getDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  documentId,
} from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const usersRef = collection(db, 'users');
const invitesRef = collection(db, 'invites');

async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(usersRef, uid));
    if (!userDoc.exists()) {
      return null;
    }
    return { uid, ...userDoc.data() };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw new Error('Failed to get user profile.');
  }
}

async function profileUpdate(uid, profileData) {
  try {
    const userRef = doc(usersRef, uid);
    await updateDoc(userRef, profileData);
    // Also update Firebase Auth user
    await getAuth().updateUser(uid, {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
    });
    console.log('Profile updated successfully for user:', uid);
    return true;
  } catch (error) {
    console.error('Failed to update profile:', error);
    return false;
  }
}

async function deletedUserAccount(uid) {
  try {
    await deleteDoc(doc(usersRef, uid));
    await getAuth().deleteUser(uid);
    console.log('Deleted account for user:', uid);
    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    return false;
  }
}

async function generateInviteCode(childId) {
  try {
    const inviteCode = getDoc().id; // Generate a unique ID
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await setDoc(doc(invitesRef, inviteCode), {
      childId,
      expiresAt,
    });

    return { inviteCode, expiresAt };
  } catch (error) {
    console.error('Failed to generate invite code:', error);
    throw new Error('Failed to generate invite code.');
  }
}

async function linkChildAccount(parentUID, inviteCode) {
  try {
    const inviteDocRef = doc(invitesRef, inviteCode);
    const inviteDoc = await getDoc(inviteDocRef);

    if (!inviteDoc.exists() || inviteDoc.data().expiresAt.toDate() < new Date()) {
      throw new Error('Invalid or expired invite code.');
    }

    const childId = inviteDoc.data().childId;

    // Add child to parent's list and parent to child's list
    const parentRef = doc(usersRef, parentUID);
    const childRef = doc(usersRef, childId);

    await updateDoc(parentRef, { children: arrayUnion(childId) });
    await updateDoc(childRef, { parent: parentUID });

    // Delete the invite code after use
    await deleteDoc(inviteDocRef);

    return { message: 'Child linked successfully.' };
  } catch (error) {
    console.error('Failed to link child account:', error);
    throw error;
  }
}

async function getLinkedChildren(parentUID) {
  try {
    const parentDoc = await getDoc(doc(usersRef, parentUID));
    if (!parentDoc.exists()) {
      throw new Error('Parent not found.');
    }
    const childIds = parentDoc.data().children || [];
    if (childIds.length === 0) {
      return [];
    }
    const childrenQuery = query(usersRef, where('__name__', 'in', childIds));
    const childrenSnapshot = await getDocs(childrenQuery);
    return childrenSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to get linked children:', error);
    throw error;
  }
}


export {
  getUserProfile,
  profileUpdate,
  deletedUserAccount,
  generateInviteCode,
  linkChildAccount,
  getLinkedChildren,
};
