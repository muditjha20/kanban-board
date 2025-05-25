// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrVS_wy5r0If2By4FZSQQq5furnciiJGY",
  authDomain: "kanbanboardapp-62dbe.firebaseapp.com",
  projectId: "kanbanboardapp-62dbe",
  storageBucket: "kanbanboardapp-62dbe.appspot.com",
  messagingSenderId: "489531772022",
  appId: "1:489531772022:web:681402f74a7dbc0917a357",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase Auth instance
export const auth = getAuth(app);
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;

  if (user) {
    return await user.getIdToken();
  }

  return null;
};
