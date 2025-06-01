import { Text, View } from 'react-native'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'

export default function favourites() {
  return (
    <View style={{paddingTop: hp(10), paddingHorizontal: wp(5)}} className="flex-1 gap-5">
      <Text>Favourites</Text>
    </View>
  )
}