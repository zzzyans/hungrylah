import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SelectableItem from '../../components/SelectableItem';
import { PRICE_RANGE_OPTIONS } from '../../constants/Preferences';
import { colourPalette } from '../../constants/Colors';
import { useAuth } from '../../context/authContext';
import UserPreferencesService from '../../services/PreferencesService';

export default function PricePreferencesScreen() {
  const router = useRouter();
  const { selectedCuisines, selectedDietary } = useLocalSearchParams();
  const [selectedPrice, setSelectedPrice] = useState(null);
  const { user } = useAuth();

  const handleSave = async () => {
    const prefs = {
      cuisines: JSON.parse(selectedCuisines),
      dietaryRestrictions: JSON.parse(selectedDietary),
      priceRange: selectedPrice,
    };

    if (!user || !user.uid) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const service = new UserPreferencesService(user.uid);
    const result = await service.savePreferences(prefs);

    if (result.success) {
      router.replace('home');
    } else {
      Alert.alert("Error", "Failed to save preferences.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Preferred Price Range</Text>
      <View style={styles.itemsContainer}>
        {PRICE_RANGE_OPTIONS.map(price => (
          <SelectableItem
            key={price.id}
            label={price.label}
            isSelected={selectedPrice === price.id}
            onPress={() => setSelectedPrice(price.id)}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Finish</Text>
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
