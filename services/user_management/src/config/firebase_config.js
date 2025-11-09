import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
// import firebaseConfig from './firebase_config.json' with { type: 'json' };

// Initialize Firebase Admin SDK
const app = initializeApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };