// app/(app)/favourites.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../../constants/Colors";
import { useAuth } from "../../../context/authContext";
import FavouriteService from "../../../services/FavouriteService";
import WriteReviewScreen from "../../writeReviewScreen";

const PLACEHOLDER_IMAGE = require("../../../assets/images/logo.png");

export default function Favourites() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // State for managing review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRestaurantForReview, setSelectedRestaurantForReview] = useState(null);

  // Optimized fetch favourites with better error handling
  const fetchFavourites = useCallback(async (isRefresh = false) => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const favs = await FavouriteService.getFavourites(user.uid);
      setFavourites(favs);
    } catch (err) {
      console.error("Error fetching favourites:", err);
      setError("Could not load favourites. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Refresh favourites every time the screen is focused (but not on initial load)
  useFocusEffect(
    useCallback(() => {
      if (user?.uid && favourites.length === 0) {
        // Only fetch if we don't have data yet
        fetchFavourites();
      } else if (user?.uid) {
        // For subsequent focuses, do a quick refresh
        fetchFavourites(true);
      }
    }, [fetchFavourites, user, favourites.length])
  );

  // Optimistic update for removing favourites
  const handleRemoveFavourite = async (restaurantId) => {
    // Store original state for rollback
    const originalFavourites = [...favourites];
    
    // Optimistic update - remove immediately
    setFavourites(prev => prev.filter(fav => fav.restaurantId !== restaurantId));
    
    try {
      await FavouriteService.removeFavourite(user.uid, restaurantId);
    } catch (error) {
      console.error("Error removing favourite:", error);
      Alert.alert("Error", "Could not remove favourite.");
      // Revert optimistic update on error
      setFavourites(originalFavourites);
    }
  };

  // Open review modal
  const handleOpenReviewModal = (restaurant) => {
    setSelectedRestaurantForReview(restaurant);
    setShowReviewModal(true);
  };

  // Close review modal and refresh list
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedRestaurantForReview(null);
    // Only refresh if we actually submitted a review
    if (showReviewModal) {
      fetchFavourites(true);
    }
  };

  // Memoized favourite card rendering for better performance
  const renderFavouriteCard = useCallback((fav) => (
    <View key={fav.id} style={styles.card}>
      <Image
        source={PLACEHOLDER_IMAGE}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{fav.name}</Text>
        <Text style={styles.meta}>
          {fav.cuisineType} • {"$".repeat(fav.priceLevel)}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveFavourite(fav.restaurantId)}
          >
            <Ionicons name="trash-outline" size={wp(5)} color={colourPalette.textDark} />
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenReviewModal(fav)}
          >
            <Ionicons name="create-outline" size={wp(5)} color={colourPalette.textDark} />
            <Text style={styles.actionButtonText}>Write Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [handleRemoveFavourite, handleOpenReviewModal]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
        <Text style={styles.loadingText}>Loading favourites...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchFavourites(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!favourites.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favourites yet.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchFavourites(true)}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Favourites</Text>
      <ScrollView 
        contentContainerStyle={styles.favContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFavourites(true)}
            colors={[colourPalette.lightBlue]}
            tintColor={colourPalette.lightBlue}
          />
        }
      >
        {favourites.map(renderFavouriteCard)}
      </ScrollView>

      {/* Review Modal */}
      {showReviewModal && selectedRestaurantForReview && (
        <WriteReviewScreen
          isVisible={showReviewModal}
          restaurantId={selectedRestaurantForReview.restaurantId}
          restaurantName={selectedRestaurantForReview.name}
          onClose={handleCloseReviewModal}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colourPalette.lightYellow,
    paddingHorizontal: wp(5),
  },
  header: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: colourPalette.textDark,
    textAlign: "center",
    marginVertical: hp(3),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow,
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
  favContainer: {
    paddingBottom: hp(4),
  },
  card: {
    backgroundColor: colourPalette.white,
    borderRadius: 15,
    marginBottom: hp(3),
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: hp(20),
  },
  cardContent: {
    padding: wp(4),
  },
  cardTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: colourPalette.textDark,
  },
  meta: {
    fontSize: wp(3.5),
    color: colourPalette.textMedium,
    marginVertical: hp(1),
  },
  cardActions: {                    
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: colourPalette.lightMint,
    paddingTop: hp(1.5),
  },
  actionButton: {                          
    alignItems: "center",
    justifyContent: "center",
    padding: wp(1),
    flexDirection: "row",
    gap: wp(1),
  },
  actionButtonText: {                    
    fontSize: wp(3.5),
    color: colourPalette.textDark,
    fontWeight: "500",
  },
});