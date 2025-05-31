import { Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAuth } from '../../context/authContext';

export default function Profile() {
 const {logout, user} = useAuth();
  const handleLogout = async ()=>{
    await logout();
  }
  console.log('user data: ', user);
  return (
    <View style={{paddingTop: hp(2), paddingHorizontal: wp(5)}} className="flex-1 gap-5">
      <Text>Profile</Text>
      <TouchableOpacity onPress={handleLogout} style={{height: hp(4.5)}} className="bg-yellow-500 rounded-xl justify-center items-center"> 
        <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  )
}