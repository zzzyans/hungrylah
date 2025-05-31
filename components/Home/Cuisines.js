import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import CuisineItem from './CuisineItem';

export default function Categories() {

    const Cuisines = [
    { id: 1, name: 'Italian' },
    { id: 2, name: 'Chinese' },
    { id: 3, name: 'Indian' },
    { id: 4, name: 'Mexican' },
    { id: 5, name: 'Japanese' },
    { id: 6, name: 'Mediterranean' },
    { id: 7, name: 'Thai' },
    { id: 8, name: 'French' }
    ];

  return (
    <View style = {{marginTop: 5}} >
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold'
      }}>Cuisines
      </Text>

      <FlatList
        data={Cuisines}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => console.log(item.name)}>
            <CuisineItem Cuisine={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}