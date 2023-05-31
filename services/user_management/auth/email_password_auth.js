import {auth} from '../firebase_config.js';
import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';

// Function to create a new user with email and password
async function createUserWithPassword(email, password) {
  try {
    const userRecord = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log('User found:', userRecord.uid);
    // Perform your sign-in logic here
    return userRecord.uid;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// Function to sign in an existing user with email and password
async function loginWithEmailAndPassword(email, password) {
  try {
    const userRecord = await signInWithEmailAndPassword(auth, email, password);
    console.log('User found:', userRecord.user.uid);
    // Perform your sign-in logic here
    return userRecord.user.uid;
  } catch (error) {
    console.error('Failed to sign in user:', error);
    throw error;
  }
}

// Get user authentificaion
function getUser() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      return uid;
      // ...
    } else {
      // User is signed out
      return null;
    }
  });
}

// Sign out user
async function signUserOut() {
  try {
    const result = await signOut(auth);
    return result;
  } catch (error) {
    console.error('Failed to sign out user:', error);
  }
}

export {
  createUserWithPassword,
  loginWithEmailAndPassword,
  signUserOut,
  getUser,
};
