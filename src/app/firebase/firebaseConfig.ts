// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKzdiHvkCeBKtt8dZ-k_xpHRsvA48G35w",
  authDomain: "diplomen-proekt-e13f5.firebaseapp.com",
  projectId: "diplomen-proekt-e13f5",
  storageBucket: "diplomen-proekt-e13f5.firebasestorage.app",
  messagingSenderId: "912965527560",
  appId: "1:912965527560:web:c4ff1f9fcbfb022e7f89bd",
  measurementId: "G-EYJ79VLQCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);