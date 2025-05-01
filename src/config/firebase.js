import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4WusTmbh948gP8Nk1_FrvjZWXZUOO9zw",
  authDomain: "school-clinic-response-system.firebaseapp.com",
  projectId: "school-clinic-response-system",
  storageBucket: "school-clinic-response-system.firebasestorage.app",
  messagingSenderId: "72798326210",
  appId: "1:72798326210:web:ef11e17cff74f977471a5b",
  measurementId: "G-4QPVLC8J5R",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Enable persistence to allow offline access
// This is optional but recommended for better user experience
try {
  db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
      console.log("Firestore persistence enabled")
    })
    .catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
      } else if (err.code === "unimplemented") {
        console.warn("The current browser does not support all of the features required to enable persistence")
      }
    })
} catch (error) {
  console.warn("Firestore persistence could not be enabled", error)
}

export default app
