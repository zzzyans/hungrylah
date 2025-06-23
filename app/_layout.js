import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from 'react';
import { AuthContextProvider, useAuth } from '../context/authContext';
import { LocationProvider } from '../context/locationContext';
import "../global.css";

const MainLayout = ()=>{
  const {isAuthenticated, user} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(()=>{
    // check if user is authenticated or not
    if (typeof isAuthenticated == 'undefined') return;

    const PUBLIC_ROUTES = ['signIn','signUp','forgotPassword','onboarding'];
    const isOnboardingRoute = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      if (!PUBLIC_ROUTES.includes(segments[0])) {
        router.replace('/signIn');
      }
      return;
    } else if (isAuthenticated && !user.hasCompletedOnboarding && !isOnboardingRoute) {
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding/cuisinePreferences')
        return;
      }
      return;
    } else if (isAuthenticated && user.hasCompletedOnboarding) {
      const inApp = ['(app)','onboarding'].includes(segments[0])
      if (!inApp) {
        router.replace('/home')
      }
      return;
    }
  }, [isAuthenticated, user, segments]);  

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