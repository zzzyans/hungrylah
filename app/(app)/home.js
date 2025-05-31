import { View } from 'react-native';
import GoogleMapView from '../../components/Home/GoogleMapView';


export default function Home() {

  return (
    <View style = {{padding: 20}} >
      <GoogleMapView /> 
    </View>
  )
}