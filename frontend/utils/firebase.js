// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "nemesisai-bbdbf.firebaseapp.com",
  projectId: "nemesisai-bbdbf",
  storageBucket: "nemesisai-bbdbf.firebasestorage.app",
  messagingSenderId: "980362465558",
  appId: "1:980362465558:web:b9eed0addcf81765ea8037"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider()