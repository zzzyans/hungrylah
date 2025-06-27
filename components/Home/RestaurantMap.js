import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { colourPalette } from "../../constants/Colors";
import { useLocation } from "../../context/locationContext";

export default function RestaurantMap({ restaurants, onMarkerPress }) {
    const { status, location } = useLocation();

    //Define a fallback region 
    const fallbackRegion = {
        latitude: 1.3521,  
        longitude: 103.8198,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };
    
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
            style={styles.map}            
            initialRegion={initialRegion}
            showsUserLocation={status === 'granted'}
            showsMyLocationButton={status === 'granted'}
            >
            {restaurants.map(rest => (
                <Marker 
                key={rest.id}
                coordinate={{
                    latitude: rest.location.lat,
                    longitude: rest.location.lng,
                }}
                title={rest.name}
                description={`${rest.cuisineType} • ${"$".repeat(rest.priceLevel)}`}
                onPress={() => onMarkerPress(rest)}
                />
            ))}
            </MapView>
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
        paddingLeft: wp(5)
    },
    map: {
        height: hp(35),
        width: wp(90),
        alignSelf: 'center',
        borderRadius: wp(4),
        paddingBottom: hp(2),
    },
  });
