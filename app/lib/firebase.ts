import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import "dotenv/config";
const apiKey = process.env.API_KEY;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "vibe-reading-9f338.firebaseapp.com",
  projectId: "vibe-reading-9f338",
  storageBucket: "vibe-reading-9f338.firebasestorage.app",
  messagingSenderId: "527194846888",
  appId: "1:527194846888:web:eb6b438ce25f17f3faf49d",
  measurementId: "G-FN1Z9VWFJJ",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
