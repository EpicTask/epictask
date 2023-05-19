import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore/lite';
import {getAuth} from 'firebase/auth';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyATAJ0EJtaAsMeTzB17MQpJJuoT4gYnchY',
  authDomain: 'task-coin-384722.firebaseapp.com',
  projectId: 'task-coin-384722',
  storageBucket: 'task-coin-384722.appspot.com',
  messagingSenderId: '672847978942',
  appId: '1:672847978942:web:e797e3882c63201e8799ef',
  measurementId: 'G-CJH3SG2YTS',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {db, auth};
