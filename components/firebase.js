import firebase from "firebase/compat/app";
import 'firebase/compat/auth'
//firestore
import "firebase/compat/firestore";
 

const firebaseConfig = {
    apiKey: "AIzaSyATI7jlQ3c2ltSubXJViUxLBi03zeHz07s",
    authDomain: "connectedfirebase-65022.firebaseapp.com",
    projectId: "connectedfirebase-65022",
    storageBucket: "connectedfirebase-65022.appspot.com",
    messagingSenderId: "217537857307",
    appId: "1:217537857307:web:a28b818590a3eaf5ed75be"
  };

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
//firestore
const db = firebase.firestore();
export {db}