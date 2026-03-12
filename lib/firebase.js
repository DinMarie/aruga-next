// lib/firebase.js

// Notice how we just say "firebase/app" instead of the long https URL!
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1Uyn4eLFuyiZ1exVaMtgwuhIpqAshrUs",
  authDomain: "projectaruga-631ff.firebaseapp.com",
  projectId: "projectaruga-631ff",
  storageBucket: "projectaruga-631ff.firebasestorage.app",
  messagingSenderId: "273058276744",
  appId: "1:273058276744:web:7e8ac70dc8d7da029e863d",
  measurementId: "G-SLQYZGPY87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);