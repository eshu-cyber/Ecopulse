import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDi6adyi55dcDbyChPgsIbgHHsnehADMws",
  authDomain: "pollutiondataanalysisloginpage.firebaseapp.com",
  projectId: "pollutiondataanalysisloginpage",
  storageBucket: "pollutiondataanalysisloginpage.firebasestorage.app",
  messagingSenderId: "215437608097",
  appId: "1:215437608097:web:9237901b798cc308bbdce0",
  measurementId: "G-951955LSS5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
