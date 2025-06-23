import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SelectableItem from '../../components/SelectableItem';
import { DIETARY_OPTIONS } from '../../constants/Preferences';
import { colourPalette } from '../../constants/Colors';

export default function DietaryPreferencesScreen() {
  const router = useRouter();
  const { selectedCuisines } = useLocalSearchParams();
  const [selectedDietary, setSelectedDietary] = useState([]);

  const toggleDiet = (item) => {
    setSelectedDietary(prev =>
      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
    );
  };

  const handleNext = () => {
    router.push({
      pathname: 'onboarding/pricePreferences',
      params: {
        selectedCuisines,
        selectedDietary: JSON.stringify(selectedDietary)
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Dietary Restrictions</Text>
      <View style={styles.itemsContainer}>
        {DIETARY_OPTIONS.map(diet => (
          <SelectableItem
            key={diet.id}
            label={diet.label}
            isSelected={selectedDietary.includes(diet.id)}
            onPress={() => toggleDiet(diet)}
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
