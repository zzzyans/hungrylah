import { Text, View } from 'react-native'

export default function CuisineItem({Cuisine}) {
  return (
    <View style={{
            backgroundColor: '#f0f0f0',
            padding: 10,
            borderRadius: 20,
            marginRight: 10
          }}>
      <Text style={{ fontSize: 16 }}>{Cuisine.name}</Text>
    </View>
  )
}