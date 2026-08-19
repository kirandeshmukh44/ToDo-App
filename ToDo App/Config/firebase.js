// Import Firebase app
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


// Import Firebase Authentication
// import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// Import Firebase Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDJU1RIsKRuoaaUqilo7jl2ALxdzQ2rJ-c",
    authDomain: "fir-project-548fe.firebaseapp.com",
    projectId: "fir-project-548fe",
    storageBucket: "fir-project-548fe.firebasestorage.app",
    messagingSenderId: "178885265050",
    appId: "1:178885265050:web:9e6d8c95a6081d4e640123",
    measurementId: "G-278BRN4NVF"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Authentication
// const auth = getAuth(app);


// Initialize Firestore
const db = getFirestore(app);


// Export Firebase services
export {
    db
};