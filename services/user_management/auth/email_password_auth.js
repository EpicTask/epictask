import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase_config.js';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

const db = getFirestore();

async function createUserWithPassword(email, password, displayName, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Set display name in Firebase Auth
    await getAdminAuth().updateUser(user.uid, { displayName });

    // Create user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, userProfile);

    const token = await user.getIdToken();
    return { token, user: userProfile };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function loginWithEmailAndPassword(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    const token = await user.getIdToken();

    // Get user profile from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userProfile = userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : null;

    return { token, user: userProfile };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

function signUserOut() {
  return signOut(auth);
}

function getUser() {
  const user = getAuth().currentUser;
  if (user) {
    return user.uid;
  } else {
    return 'No user is signed in.';
  }
}

export {
  createUserWithPassword,
  loginWithEmailAndPassword,
  signUserOut,
  getUser,
};
