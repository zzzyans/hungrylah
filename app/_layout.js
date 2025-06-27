// app/_layout.js

import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from 'react';
import { AuthContextProvider, useAuth } from '../context/authContext';
import { LocationProvider } from '../context/locationContext';
import "../global.css";

const MainLayout = ()=>{
  const {isAuthenticated} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(()=>{
    // check if user is authenticated or not
    if (typeof isAuthenticated == 'undefined') return;

    // allow signIn, signUp, preferences/* and in-app screens:
    const top = segments[0];
    const isOnboarding = top === "onboarding";
    const inApp = top === "(app)";
    const inModals = top === "(modals)";

    if (isAuthenticated) {
      if (!inApp && !isOnboarding && !inModals) {
        // if logged in, but not on a valid route, go to home
        router.replace("/home");
      }
    } else {
      // not authenticated, go to sign in
      if (top !== "signIn" && top !== "signUp" && !isOnboarding) {
        router.replace("/signIn");
      }
    }
  }, [isAuthenticated, segments]);

  return <Slot />
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <LocationProvider>
       <MainLayout />
      </LocationProvider>
    </AuthContextProvider>
  )
}