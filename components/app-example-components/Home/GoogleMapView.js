import { Dimensions, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function GoogleMapView() {
  return (
    <View style = {{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 0 }}>
      <MapView 
      provider = {PROVIDER_GOOGLE}
      showsUserLocation={true}
      showsMyLocationButton={true}
      style = {{ height: Dimensions.get("screen").height * 0.3,
                 width: Dimensions.get("screen").width * 0.9,
                 borderRadius: 20,}}>
      </MapView>
        
    </View>
  )
}