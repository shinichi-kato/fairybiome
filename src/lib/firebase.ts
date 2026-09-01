import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  value => typeof value === 'string' && value.length > 0
);
const canInitializeFirebase = typeof window !== 'undefined' && hasFirebaseConfig;

// Initialize Firebase only in the browser so prerendering does not require client credentials.
const app = canInitializeFirebase
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Set persistence for browser
if (auth && typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.warn('Failed to set persistence:', err);
  });
}

// Development: Connect to emulator if enabled
if (db && auth && process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === 'true' && typeof window !== 'undefined') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (err) {
    // Emulator already connected
  }
}

export { app, auth, db, hasFirebaseConfig };
