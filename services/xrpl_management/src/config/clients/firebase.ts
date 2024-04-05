import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase/firestore";

initializeApp();

export const db = getFirestore();