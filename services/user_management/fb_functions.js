import * as dotenv from 'dotenv';
import {db} from './firebase_config.js';
import {
  addDoc,
  doc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

dotenv.config();

const ref = collection(db, 'test_user_events');

async function saveUserEvent(eventType, eventData) {
  try {
    await addDoc(ref, {
      event_id: ref.id,
      event_type: eventType,
      user_id: eventData.user_id,
      timestamp: serverTimestamp(),
      additional_data: eventData.additional_data || {},
    });

    console.log('Event saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save event:', error);
    return false;
  }
}

// Save user interaction
async function saveUserInteraction(response) {
  try {
    await addDoc(ref, response);

    console.log('Interaction saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save interaction:', error);
    return false;
  }
}

async function profileUpdate(eventData) {
  eventData = JSON.parse(eventData);
  try {
    const userRef = doc(db, 'users', eventData.user_id);
    // Save the update to Firestore
    await updateDoc(userRef, eventData.fields);
    console.log('Event saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save event:', error);
    return false;
  }
}

// User Authenticated
async function authenticateUser(response) {
  console.log('Authenticated' + response);
  return 'Successful';
}

// Delete user account
async function deletedUserAccount(response) {
  console.log('Deleted account' + response);
  return 'Successful';
}

// Verify User
async function verifyUser(response) {
  console.log('User Verified' + response);
  return 'Successful';
}

// Connect Wallet
async function connectWallet(response) {
  console.log('Wallet Connected' + response);
  return 'Successful';
}

// Forgot password
async function forgotPassword(response) {
  console.log('Password Reset' + response);
  return 'Successful';
}
async function createChildUID(parentUID) {
  // try {
  const parentRef = collection(db, 'users', parentUID);
  //   // const uid = userRef.id;
  //   await updateDoc(parentRef, {children: arrayUnion(uid)});
  //   return uid;
  // } catch (error) {
  console.error('Failed to create child uid:', parentRef);
  // }
}

async function linkChild(data) {
  try {
    const parentUID = data.parentUID;
    const childUID = data.childUID;
    const parentRef = collection(db, 'users', parentUID);
    const childCollectionRef = collection(parentRef, 'linked');
    const childDocRef = doc(childCollectionRef, childUID);

    await setDoc(childDocRef, data);
    return 'Successful';
  } catch (error) {
    console.error('Failed to create child uid:', error);
  }
}

export {
  saveUserEvent,
  profileUpdate,
  createChildUID,
  linkChild,
  saveUserInteraction,
  authenticateUser,
  deletedUserAccount,
  verifyUser,
  connectWallet,
  forgotPassword,
};
