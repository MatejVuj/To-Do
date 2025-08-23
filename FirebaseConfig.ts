import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import { getFirestore, enableIndexedDbPersistence, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'

//getting from app.config.js
//we created that config because firebase loads before expo can get api's from the .env file
const expoExtra = Constants.expoConfig?.extra

const firebaseConfig = {
  apiKey: expoExtra?.firebaseApiKey,
  authDomain: expoExtra?.firebaseAuthDomain,
  projectId: expoExtra?.firebaseProjectId,
  storageBucket: expoExtra?.firebaseStorageBucket,
  messagingSenderId: expoExtra?.firebaseMessagingSenderId,
  appId: expoExtra?.firebaseAppId,
  measurementId: expoExtra?.firebaseMeasurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


// Enabling offline persistence for Firestore (for mobile)
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