// app/(app)/explore.js
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../constants/Colors";
import { useAuth } from "../../context/authContext";
import FavouriteService from '../../services/FavouriteService';

export default function Explore() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const FILTER_OPTIONS = ["All", "Highly Rated"];
  const [activeFilter, setActiveFilter] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);

  // Extract fetch logic
  const fetchRecommendations = () => {
    if (!user?.uid) return;
    setLoading(true);
    axios.get(`http://localhost:8000/recommendations/${user.uid}?filter=${encodeURIComponent(activeFilter)}`)
      .then(response => {
        setRestaurants(response.data.recommendations);
      })
      .catch(error => {
        console.error('Error fetching recommendations:', error);
        setRestaurants([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isFocused && user?.uid) {
      fetchRecommendations();
    }
  }, [isFocused, user, activeFilter]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
      </View>
    );
  }

  if (!restaurants.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.noMatchesText}>
          No recommendations match your preferences.
        </Text>
      </View>
    );
  }

  // Handler to add a restaurant to favourites.
  const handleAddFavourite = async (restaurant) => {
    try {
      await FavouriteService.addFavourite(user.uid, restaurant);
      Alert.alert("Success", `"${restaurant.name}" was added to your favourites.`);
    } catch (error) {
      console.error("Error adding favourite:", error);
      Alert.alert("Error", "Could not add favourite. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header} numberOfLines={2}>
          Discover Your Next Favourite Bite
        </Text>
        <TouchableOpacity
          style={styles.filterIconContainer}
          onPress={() => setShowDropdown(true)}
        >
          <Feather name="filter" size={hp(3.5)} color={colourPalette.textDark} />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={showDropdown}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.dropdown}>
          {FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.dropdownItem,
                activeFilter === opt && styles.dropdownItemActive,
              ]}
              onPress={() => {
                setActiveFilter(opt);
                setShowDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  activeFilter === opt && styles.dropdownTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {restaurants.map((r) => (
          <View key={r.id} style={styles.card}>
            <Image
              source={{ uri: r.photoURL || "https://via.placeholder.com/300" }}
              style={styles.image}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{r.name}</Text>
              <Text style={styles.cuisine}>
                {r.cuisineType} • {"$".repeat(r.priceLevel)}
              </Text>
              <Text style={styles.cardDescription}>
                Rating: {r.rating?.toFixed(1) || "N/A"}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleAddFavourite(r)} 
              >
                <Text style={styles.buttonText}>Save This Place</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colourPalette.lightYellow,
    paddingHorizontal: wp(5),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: hp(4),
    paddingHorizontal: wp(7),
    paddingVertical: wp(1),
  },
  header: {
    flex: 1,
    flexShrink: 1,
    fontSize: wp(6),
    fontWeight: "bold",
    color: colourPalette.textDark,
  },
  filterIconContainer: {
    marginLeft: wp(2),
    padding: hp(1),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow,
    padding: wp(5),
  },
  noMatchesText: {
    color: colourPalette.textDark,
    fontSize: hp(2.2),
    textAlign: "center",
  },
  scrollContainer: {
    paddingHorizontal: wp(6),
    paddingVertical: wp(5),
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  card: {
    marginRight: wp(4),
    marginTop: hp(6),
    backgroundColor: colourPalette.white,
    borderRadius: 15,
    width: wp(80),
    height: hp(50),
    elevation: 5,
  },
  image: {
    width: "100%",
    height: hp(20),
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: wp(5),
  },
  cardTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: colourPalette.textDark,
  },
  cuisine: {
    fontSize: wp(3.5),
    color: colourPalette.textMedium,
    marginVertical: hp(0.5),
  },
  cardDescription: {
    fontSize: wp(3.5),
    color: "#777",
    marginVertical: hp(1),
  },
  button: {
    marginTop: hp(2),
    backgroundColor: colourPalette.white,
    borderColor: colourPalette.lightMint,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: hp(1.5),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: colourPalette.textDark,
    fontSize: wp(3.5),
  },

  // Dropdown styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dropdown: {
    position: "absolute",
    top: hp(15),
    right: wp(5),
    width: wp(50),
    backgroundColor: colourPalette.white,
    borderRadius: wp(2),
    elevation: 5,
    paddingVertical: hp(1),
  },
  dropdownItem: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  dropdownItemActive: {
    backgroundColor: colourPalette.lightMint,
  },
  dropdownText: {
    color: colourPalette.textDark,
    fontSize: hp(2),
  },
  dropdownTextActive: {
    fontWeight: "bold",
    color: colourPalette.lightBlue,
  },
});