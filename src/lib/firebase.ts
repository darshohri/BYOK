import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCqCMc2JuJp6F0bP9IHSjv1SkqFW8i-xoQ",
  authDomain: "byok-accdd.firebaseapp.com",
  databaseURL: "https://byok-accdd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "byok-accdd",
  storageBucket: "byok-accdd.firebasestorage.app",
  messagingSenderId: "786204617052",
  appId: "1:786204617052:web:2c5c407697874f2d7f7999",
  measurementId: "G-C6YEST76X7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
