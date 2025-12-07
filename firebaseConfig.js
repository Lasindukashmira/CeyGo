// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDypCSM35RAUjpUxEuUb-DjwtbxJpuGunE",
  authDomain: "ceygo-4413f.firebaseapp.com",
  projectId: "ceygo-4413f",
  storageBucket: "ceygo-4413f.firebasestorage.app",
  messagingSenderId: "1091084262512",
  appId: "1:1091084262512:web:c72949298636f3a910e8b5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
