// app/(modals)/_layout.js
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="restaurantDetails" 
        options={{
          headerShown: false, 
          presentation: 'modal', 
        }}
      />
    </Stack>
  );
}