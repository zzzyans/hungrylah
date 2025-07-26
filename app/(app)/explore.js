// app/(app)/explore.js
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Swiper from 'react-native-deck-swiper';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../constants/Colors";
import { useAuth } from "../../context/authContext";
import FavouriteService from '../../services/FavouriteService';
import RecommendationCacheService from '../../services/RecommendationCacheService';

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Explore() {
  const { user } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const FILTER_OPTIONS = ["All", "Highly Rated"];
  const [activeFilter, setActiveFilter] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const swiperRef = useRef(null);
  const [lastSavedIndex, setLastSavedIndex] = useState(null);

  // Optimized fetch logic with caching
  const fetchRecommendations = useCallback(async (isRefresh = false) => {
    if (!user?.uid) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const recommendations = await RecommendationCacheService.getRecommendations(user.uid, activeFilter);
      setRestaurants(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Could not fetch recommendations. Please try again.');
      setRestaurants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeFilter]);

  // Load data on mount and focus
  useEffect(() => {
    if (isFocused && user?.uid) {
      fetchRecommendations();
    }
  }, [isFocused, user, activeFilter, fetchRecommendations]);

  // Preload recommendations when user changes
  useEffect(() => {
    if (user?.uid) {
      RecommendationCacheService.preloadRecommendations(user.uid);
    }
  }, [user?.uid]);

  // Handler to add a restaurant to favourites with optimistic updates
  const handleAddFavourite = async (restaurant, cardIndex) => {
    if (lastSavedIndex === cardIndex) return; // Prevent double-saving
    setLastSavedIndex(cardIndex);
    
    try {
      // Optimistic update - remove from current list immediately
      setRestaurants(prev => prev.filter((_, index) => index !== cardIndex));
      
      await FavouriteService.addFavourite(user.uid, restaurant);
      Alert.alert("Success", `"${restaurant.name}" was added to your favourites.`);
    } catch (error) {
      console.error("Error adding favourite:", error);
      Alert.alert("Error", "Could not add favourite. Please try again.");
      // Revert optimistic update on error
      setRestaurants(prev => [...prev, restaurant]);
    }
  };

  const handleMoreDetails = (restaurant) => {
    router.push({
      pathname: "(modals)/restaurantDetails",
      params: { restaurantId: restaurant.id },
    });
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    setShowDropdown(false);
    setLastSavedIndex(null); // Reset saved index for new filter
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchRecommendations(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!restaurants.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No recommendations match your preferences.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchRecommendations(true)}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              onPress={() => handleFilterChange(opt)}
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

      <View style={styles.swiperWrapper}>
        <Swiper
          ref={swiperRef}
          cards={restaurants}
          renderCard={(r) => (
            <View style={styles.card}>
              <View style={styles.cardInnerContent}>
                <Text style={styles.cardTitle}>{r.name}</Text>
                <Text style={styles.cuisine}>
                  {r.cuisineType} • {"$".repeat(r.priceLevel)}
                </Text>
                <Text style={styles.cardRating}>
                  Rating: {r.rating?.toFixed(1) || "N/A"}
                </Text>
                {r.address && <Text style={styles.cardAddress} numberOfLines={2}>{r.address}</Text>}
              </View>
              <TouchableOpacity
                style={styles.moreDetailsButton}
                onPress={() => handleMoreDetails(r)}
              >
                <Text style={styles.moreDetailsButtonText}>More Details</Text>
              </TouchableOpacity>
            </View>
          )}
          cardIndex={0}
          backgroundColor={colourPalette.lightYellow}
          stackSize={3}
          disableTopSwipe
          disableBottomSwipe
          cardStyle={{ width: wp(88), height: hp(58), borderRadius: 15 }}
          onSwipedRight={(cardIndex) => handleAddFavourite(restaurants[cardIndex], cardIndex)}
        />
      </View>
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
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(4),
    color: colourPalette.textMedium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow,
    padding: wp(5),
  },
  errorText: {
    color: colourPalette.textDark,
    fontSize: hp(2.2),
    textAlign: "center",
    marginBottom: hp(3),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow,
    padding: wp(5),
  },
  emptyText: {
    color: colourPalette.textDark,
    fontSize: hp(2.2),
    textAlign: "center",
    marginBottom: hp(3),
  },
  retryButton: {
    backgroundColor: colourPalette.lightBlue,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
  },
  retryButtonText: {
    color: colourPalette.white,
    fontSize: wp(4),
    fontWeight: "bold",
  },
  swiperWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  card: {
    backgroundColor: colourPalette.white,
    borderRadius: 15,
    width: wp(88), 
    height: hp(58), 
    elevation: 5,
    justifyContent: 'space-between', 
    alignItems: 'stretch', 
    paddingBottom: hp(2), 
  },
  cardInnerContent: { 
    padding: wp(5), 
    flex: 1, 
    justifyContent: 'center', 
  },
  cardTitle: {
    fontSize: wp(6.5), 
    fontWeight: "bold",
    color: colourPalette.textDark,
    marginBottom: hp(1),
  },
  cuisine: {
    fontSize: wp(4.5), 
    color: colourPalette.textMedium,
    marginBottom: hp(0.5),
  },
  cardRating: { 
    fontSize: wp(4.5), 
    color: colourPalette.textDark,
    marginBottom: hp(1),
  },
  cardAddress: { 
    fontSize: wp(3.8),
    color: colourPalette.textMedium,
    marginTop: hp(1),
    lineHeight: hp(2.2),
  },
  moreDetailsButton: { 
    backgroundColor: colourPalette.lightLavender, 
    borderColor: colourPalette.lightLavender, 
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: hp(1.8),
    marginHorizontal: wp(5), 
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreDetailsButtonText: {
    color: colourPalette.white, 
    fontSize: wp(4),
    fontWeight: 'bold',
  },
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