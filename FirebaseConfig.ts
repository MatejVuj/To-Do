// Import the functions you need from the SDKs you need
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADxa4XECBtCE9frgO4ydfTlcIYp4Yif7U",
  authDomain: "to-do-9e42f.firebaseapp.com",
  projectId: "to-do-9e42f",
  storageBucket: "to-do-9e42f.firebasestorage.app",
  messagingSenderId: "241276136678",
  appId: "1:241276136678:web:a355787090965df9e69f27",
  measurementId: "G-132R7GJM4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app);


// Enable offline persistence for Firestore (for mobile)
if (Platform.OS !== 'web') {
  enableIndexedDbPersistence(firestore)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.log('The current browser does not support all of the features required to enable persistence.');
      }
    });
}


export { app, auth, firestore, serverTimestamp, storage, functions };