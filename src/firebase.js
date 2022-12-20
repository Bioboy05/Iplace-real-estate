// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8hZZrgBAB0VKXXCqgZgrha3w5U-YDJUI",
  authDomain: "imobiliare-f1bc7.firebaseapp.com",
  projectId: "imobiliare-f1bc7",
  storageBucket: "imobiliare-f1bc7.appspot.com",
  messagingSenderId: "210267455400",
  appId: "1:210267455400:web:76f6c94c46bb72d14c279d",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()
