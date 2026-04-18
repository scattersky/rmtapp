import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB3Xw1ZeN-TIF40iaT7_DczGYywQ_gZUrA",
    authDomain: "ratemytone-1246f.firebaseapp.com",
    projectId: "ratemytone-1246f",
    storageBucket: "ratemytone-1246f.firebasestorage.app",
    messagingSenderId: "295571306739",
    appId: "1:295571306739:web:100491ed7d72825687df86",
    measurementId: "G-L00Y0MH1Q5"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);