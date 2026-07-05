/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtIDB8quG8bU_kGBzfLvRAACUMuShy1lo",
  authDomain: "igneous-grammar-7tsmh.firebaseapp.com",
  projectId: "igneous-grammar-7tsmh",
  storageBucket: "igneous-grammar-7tsmh.firebasestorage.app",
  messagingSenderId: "92549410903",
  appId: "1:92549410903:web:20c0fa914958e24fce7312"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId from the config
export const db = initializeFirestore(app, {}, "ai-studio-projectfolderai-fb51e26d-3238-4cf4-ad83-88c8dfe8bea6");
