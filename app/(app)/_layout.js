import { Slot, Tabs, useRouter, useSegments } from "expo-router";
import { useEffect } from 'react';
import { AuthContextProvider, useAuth } from '../../context/authContext';


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
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home'
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Favourites'
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile'
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search'
        }}
      />
      <Slot />
    </Tabs>

  );
}

export default function layout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  )
}