// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRNe75WfoHrEtN9i_w1p1RSW0qAQbE-7o",
  authDomain: "beevent-ef3b5.firebaseapp.com",
  projectId: "beevent-ef3b5",
  storageBucket: "beevent-ef3b5.firebasestorage.app",
  messagingSenderId: "1069433112447",
  appId: "1:1069433112447:web:4dca3f4a400deff5ccbc4a",
  measurementId: "G-LBNRH4W6DM"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



const auth = getAuth();
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
