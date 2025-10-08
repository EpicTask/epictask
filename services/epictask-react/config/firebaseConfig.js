import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getAuth, initializeAuth, getReactNativePersistence} from 'firebase/auth';
import firebaseConfig from './firebaseConfig.json' with { type: 'json' };
import AsyncStorage from '@react-native-async-storage/async-storage';
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
//
// const auth = getAuth(app);

export {db, auth};
