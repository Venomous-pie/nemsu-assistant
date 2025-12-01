// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDPBaNvTa-XosSgiRgw35eobRQ71P5QvCA",
    authDomain: "nemsu-assistant.firebaseapp.com",
    projectId: "nemsu-assistant",
    storageBucket: "nemsu-assistant.firebasestorage.app",
    messagingSenderId: "960184778604",
    appId: "1:960184778604:web:a7776698e88de486d5bd49",
    measurementId: "G-SQE4SBDPGB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);