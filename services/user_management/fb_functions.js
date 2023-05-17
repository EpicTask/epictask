const { initializeApp } = require('firebase-admin/app');
const { firestore } = require('firebase-admin');
initializeApp();

const db = firestore();

async function saveUserEvent(eventType, eventData) {
  try {
    // Generate a unique event ID
    const eventId = db.collection('user_events').doc().id;

    // Save the event to Firestore
    await db.collection('user_events').doc(eventId).set({
      event_id: eventId,
      event_type: eventType,
      user_id: eventData.user_id,
      timestamp: firestore.FieldValue.serverTimestamp(),
      additional_data: eventData.additional_data || {}
    });

    console.log('Event saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save event:', error);
    return false;
  }
}

module.exports = saveUserEvent;

