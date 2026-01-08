import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyByHguRC4fVmuFgAP_2YxApjh66UiyQMSw",
    authDomain: "menu-recommendation-olaf.firebaseapp.com",
    projectId: "menu-recommendation-olaf",
    storageBucket: "menu-recommendation-olaf.firebasestorage.app",
    messagingSenderId: "1012094925614",
    appId: "1:1012094925614:web:01a282b822e2e90d9ad8bf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
