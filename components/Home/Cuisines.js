import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../constants/Colors"; // Import color palette
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
    <View style={styles.container} >
      <Text style={styles.title}>Cuisines</Text>

      <FlatList
        data={Cuisines}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => console.log(item.name)} 
            style={styles.cuisineTouchable} 
            activeOpacity={0.7}
          >
            <CuisineItem Cuisine={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: hp(2.5), 
    fontWeight: "bold",
    color: colourPalette.textDark, 
    marginBottom: hp(1.5), 
  },
  cuisineTouchable: {
    marginRight: wp(3), 
  },
  flatListContent: {
    paddingVertical: hp(1), 
  },
});