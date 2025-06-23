import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SelectableItem from '../../components/SelectableItem';
import { CUISINE_OPTIONS } from '../../constants/Preferences';
import { colourPalette } from "../../constants/Colors"

export default function CuisinePreferencesScreen() {
  const router = useRouter();
  const [selectedCuisines, setSelectedCuisines] = useState([]);

  const toggleCuisine = (item) => {
    setSelectedCuisines(prev =>
      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
    );
  };

  const handleNext = () => {
    router.push({ pathname: 'onboarding/dietaryPreferences', params: { selectedCuisines: JSON.stringify(selectedCuisines) } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Favourite Cuisines</Text>
      <View style={styles.itemsContainer}>
        {CUISINE_OPTIONS.map(cuisine => (
          <SelectableItem
            key={cuisine.id}
            label={cuisine.label}
            isSelected={selectedCuisines.includes(cuisine.id)}
            onPress={() => toggleCuisine(cuisine)}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colourPalette.lightYellow,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: colourPalette.lightBlue,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
