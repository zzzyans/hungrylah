// app/(app)/editPreferences.js
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import ScreenHeader from "../../../components/ScreenHeader";
import SelectableItem from "../../../components/SelectableItem";
import { colourPalette } from "../../../constants/Colors";
import { CUISINE_OPTIONS, DIETARY_OPTIONS, PRICE_RANGE_OPTIONS } from "../../../constants/Preferences";
import { useAuth } from "../../../context/authContext";
import PreferencesService from "../../../services/PreferencesService";

export default function EditPreferencesScreen() {
    const router = useRouter();
    const { user } = useAuth();
  
    // service instance, created once user is available
    const preferencesService = useMemo(() => {
    if (user && user.uid) {
        return new PreferencesService(user.uid);
    }
    return null;
    }, [user]);

    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [selectedDietary, setSelectedDietary] = useState([]);
    const [selectedPrice, setSelectedPrice] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPrefs, setIsFetchingPrefs] = useState(true);

    useEffect(() => {
        const loadPreferences = async () => {
        if (preferencesService) {
            setIsFetchingPrefs(true);
            const result = await preferencesService.fetchPreferences();
            if (result.success && result.data) {
            setSelectedCuisines(result.data.cuisines);
            setSelectedDietary(result.data.dietaryRestrictions);
            setSelectedPrice(result.data.priceRange);
            } else if (!result.success) {
            Alert.alert("Error", "Could not load your preferences.");
            }
            setIsFetchingPrefs(false);
        } else if (!user) {
            setIsFetchingPrefs(false);
        }};
        loadPreferences();
    }, [preferencesService, user]);

    const toggleSelection = (item, list, setList) => {
        if (list.includes(item.id)) {
        setList(list.filter((id) => id !== item.id));
        } else {
        setList([...list, item.id]);
        }
    };

    const handleSavePreferences = async()=>{
        if (!preferencesService) {
            Alert.alert("Error", "You must be logged in to save preferences.");
            return;
        }
        setIsLoading(true);
        const prefsToSave = {
            cuisines: selectedCuisines,
            dietaryRestrictions: selectedDietary,
            priceRange: selectedPrice,
        };
        const result = await preferencesService.savePreferences(prefsToSave);
    
        if (result.success) {
        Alert.alert("Success", "Preferences saved!", [
            { text: "OK", onPress: () => router.push("../profile") },
        ]);
        } else {
        Alert.alert("Error", "Could not save preferences. Please try again.");
        }
        setIsLoading(false);
    };

    if (isFetchingPrefs) {
        return (
            <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colourPalette.lightBlue} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Taste Preferences" /> 
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.container}
            >

            <Text style={styles.sectionTitle}>Favourite Cuisines</Text>
            <View style={styles.itemsContainer}>
                {CUISINE_OPTIONS.map((cuisine) => (
                <SelectableItem
                    key={cuisine.id}
                    label={cuisine.label}
                    isSelected={selectedCuisines.includes(cuisine.id)}
                    onPress={() =>
                    toggleSelection(cuisine, selectedCuisines, setSelectedCuisines)
                    }
                />
                ))}
            </View>

            <Text style={styles.sectionTitle}>
                Dietary Restrictions
            </Text>
            <View style={styles.itemsContainer}>
                {DIETARY_OPTIONS.map((diet) => (
                <SelectableItem
                    key={diet.id}
                    label={diet.label}
                    isSelected={selectedDietary.includes(diet.id)}
                    onPress={() =>
                    toggleSelection(diet, selectedDietary, setSelectedDietary)
                    }
                />
                ))}
            </View>

            <Text style={styles.sectionTitle}>Preferred Price Range</Text>
            <View style={styles.itemsContainer}>
                {PRICE_RANGE_OPTIONS.map((price) => (
                <SelectableItem
                    key={price.id}
                    label={price.label}
                    isSelected={selectedPrice === price.id}
                    onPress={() => setSelectedPrice(price.id)}
                />
                ))}
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePreferences}
                disabled={isLoading}
            >
                {isLoading ? (
                <ActivityIndicator color={colourPalette.white} />
                ) : (
                <Text style={styles.saveButtonText}>Save Preferences</Text>
                )}
            </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colourPalette.lightYellow,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        paddingHorizontal: wp(5), 
        paddingBottom: hp(5),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colourPalette.lightYellow,
    },
    sectionTitle: {
        fontSize: hp(2.2),
        fontWeight: "600",
        color: colourPalette.textMedium,
        marginTop: hp(2.5),
        marginBottom: hp(1.5),
    },
    itemsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: wp(2.5),
    },
    saveButton: {
        backgroundColor: colourPalette.lightBlue,
        paddingVertical: hp(2),
        borderRadius: wp(3),
        alignItems: "center",
        marginTop: hp(4),
    },
    saveButtonText: {
        color: colourPalette.white,
        fontSize: hp(2.2),
        fontWeight: "bold",
    },
});