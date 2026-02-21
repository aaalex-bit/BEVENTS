// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
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




 const loginbutton = document.querySelector("#loginBtn")


loginbutton.addEventListener('click', async(e)=>{
    //values
    const email = document.querySelector('#username').value
    const password = document.querySelector("#password").value


    //handles invalid email and password types
    if(email.trim() === '' || password.trim===''){
        alert('email or password incorrect or not filled out')
    }else{

        //FIREBASE SIGNING IN
        try{
            
            const app = initializeApp(firebaseConfig);
            const analytics = getAnalytics(app);
            const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
            console.log("signed in")
            
            window.location.href = 'HomePg.html'
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("error")
    });
        }catch (error){
            alert('Login might be down for now try another time')
        }finally{
        }
    }
    
   
})
