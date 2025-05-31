// GoogleMapView.js
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
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
    <View style={styles.outerContainer}>
      {status === 'denied' && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Location permission denied. Showing default region.
          </Text>
        </View>
      )}
      <Text style={{paddingTop: 5, fontSize: 20, fontWeight: 'bold'}}>  
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
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#cc0000',
    padding: 8,
    zIndex: 1000,
  },
  bannerText: {
    color: '#fff',
    textAlign: 'center',
  },
  map: {
    height: Dimensions.get('screen').height * 0.3,  // 30% of screen height
    width: Dimensions.get('screen').width * 0.9,    // 90% of screen width
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
});