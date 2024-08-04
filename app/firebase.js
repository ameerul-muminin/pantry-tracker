// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAl4Abiez-19NNkmtjt8Saz7U5qS5eL6Y4",
  authDomain: "pantry-tracker-3cdf8.firebaseapp.com",
  projectId: "pantry-tracker-3cdf8",
  storageBucket: "pantry-tracker-3cdf8.appspot.com",
  messagingSenderId: "760205398150",
  appId: "1:760205398150:web:4a4b33b7ea4113932fc107",
  measurementId: "G-647ZMWTTD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics if running in the browser
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const db = getFirestore(app);
export const storage = getStorage(app); 
