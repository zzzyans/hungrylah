import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colourPalette } from "../../constants/Colors";

const MainLayout = ()=>{
  
  return (
    <Tabs screenOptions = {{
      headerShown: false,
      tabBarActiveTintColor: colourPalette.darkBlue,
      tabBarInactiveTintColor: colourPalette.lightBlue, 
      tabBarStyle: {
          backgroundColor: colourPalette.lightYellow,
          borderTopWidth: 1,
          borderTopColor: colourPalette.lightMint,
          height: 80,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}>
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
    </Tabs>

  );
}

export default function TabLayout() {
  return (
      <MainLayout />
  )
}