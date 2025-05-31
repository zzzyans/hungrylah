import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext({
  status: "undetermined",    // 'granted' | 'denied' | 'undetermined'
  location: null,            // { latitude, longitude, latitudeDelta, longitudeDelta }
  error: null,
});

export function LocationProvider({ children }) {
  const [status, setStatus] = useState("undetermined");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // 1) Check existing permission
        let { status: existingStatus } = await Location.getForegroundPermissionsAsync();
        if (existingStatus === "undetermined") {
          let { status: requestStatus } = await Location.requestForegroundPermissionsAsync();
          existingStatus = requestStatus;
        }
        setStatus(existingStatus);

        if (existingStatus !== "granted") {
          // User denied or never asked; skip fetch
          return;
        }

        // 2) Try cached first
        let cached = await Location.getLastKnownPositionAsync();
        if (cached) {
          const {
            coords: { latitude, longitude },
          } = cached;
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }

        // 3) Then do a Balanced fix
        try {
          let fresh = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 5000,
            timeout: 7000,
          });
          const {
            coords: { latitude, longitude },
          } = fresh;
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } catch (err) {
          // Timeout or other error—ignore or store
          setError(err);
        }
      } catch (err) {
        setError(err);
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ status, location, error }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}