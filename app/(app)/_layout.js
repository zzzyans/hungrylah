import { Ionicons } from "@expo/vector-icons";
import { Slot, Tabs, useRouter, useSegments } from "expo-router";
import { useEffect } from 'react';
import { useAuth } from '../../context/authContext';


const MainLayout = ()=>{
  const {isAuthenticated} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(()=>{
    // check if user is authenticated or not
    if (typeof isAuthenticated == 'undefined') return;
    const inApp = segments[0] == '(app)';
    if (isAuthenticated && !inApp) {
      // redirect to home
      router.replace('home');
    } else if (isAuthenticated == false) {
      // redirect to signIn
      router.replace('signIn');
    }
  },[isAuthenticated])

  return (
    <Tabs screenOptions = {{
      headerShown: false}}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          tabBarLabel: 'Favourites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          )
        }}
      />
      <Slot />
    </Tabs>

  );
}

export default function layout() {
  return (
      <MainLayout />
  )
}