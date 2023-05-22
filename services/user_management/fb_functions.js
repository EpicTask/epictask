import * as dotenv from 'dotenv';
import {db} from './firebase_config.js';
import {
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

dotenv.config();

const ref = collection(db, 'test_user_events');
const userRef = collection(db, 'users');
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

async function profileUpdate(eventData) {
  try {
    // Save the update to Firestore
    await updateDoc(userRef, eventData.fields);
    console.log('Event saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save event:', error);
    return false;
  }
}

export {saveUserEvent, profileUpdate};
