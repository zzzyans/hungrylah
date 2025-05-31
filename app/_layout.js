import { Slot } from "expo-router";
import React from 'react';
import { AuthContextProvider } from '../context/authContext';
import { LocationProvider } from '../context/locationContext';
import "../global.css";


export default function RootLayout() {
  return (
    <AuthContextProvider>
      <LocationProvider>
       <Slot />
      </LocationProvider>
    </AuthContextProvider>
  )
}
