// GoogleMapView.js
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../constants/Colors";
import { useLocation } from "../../context/locationContext";

export default function GoogleMapView() {

    const { status, location } = useLocation();

    //Define a fallback region (e.g. your city center, or [0,0]) for the map
    const fallbackRegion = {
    latitude: 1.3521,   // Singapore’s approximate center, for example
    longitude: 103.8198,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  //If context gave us a real location, use it; otherwise use fallback
  const initialRegion = location || fallbackRegion;

    
  return (
    <View>
      {status === 'denied' && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Location permission denied. Showing default region.
          </Text>
        </View>
      )}
      <Text style={styles.mapTitle}>  
        Nearby Restaurants
      </Text>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}             // ← apply your exact style here
        initialRegion={initialRegion}
        showsUserLocation={status === 'granted'}
        showsMyLocationButton={status === 'granted'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    backgroundColor: colourPalette.lightPeach,
    paddingVertical: hp(1), 
    paddingHorizontal: wp(2),
    zIndex: 1000, 
    borderRadius: wp(2), 
    marginBottom: hp(1),
  },
  bannerText: {
    color: colourPalette.textDark,
    textAlign: 'center',
    fontSize: hp(1.7), 
    fontWeight: "500",
  },
  mapTitle: {
    paddingTop: hp(0.5), 
    fontSize: hp(2.5), 
    fontWeight: "bold",
    color: colourPalette.textDark, 
    marginBottom: hp(1.5),
  },
  map: {
    height: Dimensions.get('screen').height * 0.3,  // 30% of screen height
    width: Dimensions.get('screen').width * 0.9,    // 90% of screen width
  },
});