import * as dotenv from 'dotenv';
import {db} from './firebase_config.js';
import {addDoc, collection, FieldValue} from 'firebase/firestore';

dotenv.config();

// const userRef = collection(db, process.env.USERS_COLLECTION);

async function saveUserEvent(eventType, eventData) {
  try {
    // Generate a unique event ID
    const eventId = userEventRef.doc().id;

    const userEventRef = await addDoc(
      collection(db, process.env.USER_EVENT_COLLECTION),
      {
        event_id: eventId,
        event_type: eventType,
        user_id: eventData.user_id,
        timestamp: FieldValue.serverTimestamp(),
        additional_data: eventData.additional_data || {},
      }
    );

    console.log('Event saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save event:', error);
    return false;
  }
}

// async function profileUpdate(eventData) {
//   try {
//     // Save the update to Firestore
//     await userRef.doc(eventData.user_id).update(eventData.fields);
//     console.log('Event saved successfully');
//     return true;
//   } catch (error) {
//     console.error('Failed to save event:', error);
//     return false;
//   }
// }

export {saveUserEvent};
