import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your main Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB4WusTmbh948gP8Nk1_FrvjZWXZUOO9zw",
    authDomain: "school-clinic-response-system.firebaseapp.com",
    projectId: "school-clinic-response-system",
    storageBucket: "school-clinic-response-system.firebasestorage.app",
    messagingSenderId: "72798326210",
    appId: "1:72798326210:web:ef11e17cff74f977471a5b",
    measurementId: "G-4QPVLC8J5R",
};

// Initialize the main app instance
const app = initializeApp(firebaseConfig);

// Main instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Initialize a secondary Firebase app instance (used for user creation only)
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
