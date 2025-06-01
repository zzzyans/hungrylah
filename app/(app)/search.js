import { Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function search() {
  return (
    <View style={{paddingTop: hp(10), paddingHorizontal: wp(5)}} className="flex-1 gap-5">
      <Text>Search</Text>
    </View>
  )
}