// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBYB7b4npWuWB00xuv7OAcmvBmRPYFadAw",
    authDomain: "unidate-2830e.firebaseapp.com",
    projectId: "unidate-2830e",
    storageBucket: "unidate-2830e.firebasestorage.app",
    messagingSenderId: "686709765439",
    appId: "1:686709765439:web:f03ca9615ca454683ccf8a",
    measurementId: "G-BYYRV6NG9M"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// ✅ Login function
export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken(); // Token gửi BE
    return token;
};
