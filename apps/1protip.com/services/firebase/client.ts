import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCDqN4IRNDPtFeV6xHkgty15cujtJDNUWE",
  authDomain: "hashtag-1-pro-tip.firebaseapp.com",
  projectId: "hashtag-1-pro-tip",
  storageBucket: "hashtag-1-pro-tip.firebasestorage.app",
  messagingSenderId: "913396219284",
  appId: "1:913396219284:web:7311bf2ce1a3c9203d6381"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
