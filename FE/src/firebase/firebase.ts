import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
    measurementId: "G-BYYRV6NG9M",
};

// ✅ Avoid duplicate init
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);

// ✅ Login function
export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return token;
};
