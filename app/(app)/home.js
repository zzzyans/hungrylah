import { View } from 'react-native';
import Cuisines from '../../components/Home/Cuisines';
import GoogleMapView from '../../components/Home/GoogleMapView';
import Header from '../../components/Home/Header';


export default function Home() {

  return (
    <View style = {{padding: 20}} >
      <Header />
      <GoogleMapView /> 
      <Cuisines />
    </View>
  )
}