
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDmt1LTc3f_CBB8pd3viCJLHlQtKVhMEU8",
  authDomain: "redbow-24723.firebaseapp.com",
  projectId: "redbow-24723",
  storageBucket: "redbow-24723.firebasestorage.app",
  messagingSenderId: "322692287326",
  appId: "1:322692287326:web:cda79367be903bd6bb5dcf",
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
