// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Your web app's Firebase configuration
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHeiLBbzH0rLp-J4tVf1KN1-ro81EYFUw",
  authDomain: "hungrylah-201dd.firebaseapp.com",
  projectId: "hungrylah-201dd",
  storageBucket: "hungrylah-201dd.firebasestorage.app",
  messagingSenderId: "1098935971136",
  appId: "1:1098935971136:web:462d0ad70f1c19673cdea5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
