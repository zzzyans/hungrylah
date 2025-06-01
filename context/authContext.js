import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { app, auth, db } from "../firebaseConfig";

const storage = getStorage(app);
export const AuthContext = createContext();

export const AuthContextProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(()=>{
        const unsub = onAuthStateChanged(auth, (user)=>{
            console.log('got user: ', user);
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                updateUserData(user.uid);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        });
        return unsub;
    }, []);

    const updateUserData = async (userId)=>{
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data();
            setUser(user=>({...user, username: data.username, userId: data.userId}));
        }
    }

    const login = async(email, password)=>{
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            return {success: true};
        } catch(e) {
            let msg = e.message;
            if (e.code === 'auth/invalid-email') {
                msg = 'Invalid email.';
            } else if (e.code === 'auth/user-not-found') {
                msg = 'No user found with this email. Please sign up.';
            } else if (e.code === 'auth/wrong-password') {
                msg = 'Incorrect password. Please try again.';
            } else if (e.code === 'auth/invalid-credential') { 
                msg = 'Invalid credentials. Please check your email and password.';
            } else if (e.code === 'auth/user-disabled') {
                msg = 'This user account has been disabled.';
            } else if (e.code === 'auth/too-many-requests') {
                msg = 'Access to this account has been temporarily disabled due to too many failed login attempts. Please try again later or reset your password.';
            } else {
                msg = 'Login failed. Please try again.';
            }
            return {success: false, msg};
        }
    }

    const logout = async()=>{
        try {
            await signOut(auth);
            return {success: true};
        } catch(e) {
            return {success: false, msg: e.message, error: e};
        }
    }

    const register = async(email, password, username)=>{
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log('response.user :', response?.user);

            await setDoc(doc(db, "users", response?.user?.uid), {
                username,
                userId: response?.user?.uid
            });
            return {success: true, data: response?.user};
        } catch(e) {
            let msg = e.message;
            if (e.code === 'auth/invalid-email') {
                msg = 'Invalid email address format.';
            } else if (e.code === 'auth/email-already-in-use') {
                msg = 'This email address is already in use by another account.';
            } else if (e.code === 'auth/operation-not-allowed') {
                msg = 'Email/password sign-up is not enabled. Contact support.';
            } else {
                msg = 'Registration failed. Please try again.';
            return {success: false, msg};
            }
        }
    }

    const sendPasswordResetEmailFunc = async(email) =>{
        try {
            const response = await sendPasswordResetEmail(auth, email);
            return {success: true, msg: "Password reset email sent. Please check your inbox."};
        } catch (e) {
            let msg = e.message;
            if (msg.includes("(auth/invalid-email)")) {
                msg = "Invalid email address.";
            } else if (msg.includes("(auth/user-not-found)")) {
                msg = "No user found with this email address.";
            }
            console.log("Password Reset Error:", e);
            return { success: false, msg };
        }
    }

    const updateProfilePicture = async(imageUri) => {
        if (!user) return { success: false, msg: "User not authenticated." };
    
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const fileExtension = imageUri.split(".").pop();
          const fileName = `${user.uid}_${Date.now()}.${fileExtension}`;
          const storageRef = ref(storage, `profile_pictures/${user.uid}/${fileName}`);
    
          await uploadBytes(storageRef, blob);
    
          const downloadURL = await getDownloadURL(storageRef);
    
          await updateProfile(auth.currentUser, { photoURL: downloadURL });
    
          setUser((prevUser) => ({
            ...prevUser,
            photoURL: downloadURL,
          }));
    
          return { success: true, photoURL: downloadURL };
        } catch (e) {
          console.error("Error uploading profile picture:", e);
          return { success: false, msg: e.message };
        }
    };

    return (
        <AuthContext.Provider value={{user, isAuthenticated, login, register, logout, sendPasswordResetEmail: sendPasswordResetEmailFunc, updateProfilePicture}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    const value = useContext(AuthContext);
    
    if (!value) {
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }

    return value;
}